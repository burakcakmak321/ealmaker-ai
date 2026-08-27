/**
 * Etsy Open API v3 için tek HTTP çıkış noktası.
 *
 * Bu modülün dışında hiçbir yerde Etsy'ye doğrudan `fetch` yapılmaz; hız
 * sınırı, yeniden deneme ve hata çevirisi tek yerde toplanır.
 *
 * Etsy sınırı: 10 istek/saniye, 10.000 istek/gün (uygulama anahtarı başına).
 */

import { EtsyApiError, codeFromStatus } from "./errors";

const API_BASE = "https://openapi.etsy.com/v3/application";

/** Etsy'nin saniyelik sınırının yarısı: aynı anda iki sıcak lambda olsa bile taşmayız. */
const DEFAULT_RPS = 5;
const DEFAULT_TIMEOUT_MS = 15_000;

export function getEtsyApiKey(): string | null {
  const key = process.env.ETSY_API_KEY?.trim();
  return key ? key : null;
}

export function hasEtsyApiKey(): boolean {
  return getEtsyApiKey() !== null;
}

/**
 * Örnek veri modu. Production'da bilerek kapalıdır: kaçak bir ortam
 * değişkeni canlı bir mağazada sahte yazma yapmasın diye.
 */
export function isMockMode(): boolean {
  if (process.env.ETSY_MOCK !== "1") return false;
  if (process.env.NODE_ENV === "production" && process.env.ETSY_MOCK_ALLOW_PROD !== "1") {
    return false;
  }
  return true;
}

/* --------------------------------- hız sınırı -------------------------------- */

export type RateLimiter = { acquire(): Promise<void> };

/**
 * Basit token bucket. Not: bu sınırlayıcı lambda örneği başınadır, global
 * değildir — birden fazla eşzamanlı örnek toplamda sınırı aşabilir. Gerçek
 * emniyet supabı 429 + Retry-After işlemedir (aşağıda).
 */
export function createRateLimiter(opts: { ratePerSecond: number; burst?: number }): RateLimiter {
  const rate = Math.max(1, opts.ratePerSecond);
  const burst = Math.max(1, opts.burst ?? rate);
  let tokens = burst;
  let last = Date.now();
  let chain: Promise<void> = Promise.resolve();

  async function take(): Promise<void> {
    for (;;) {
      const now = Date.now();
      tokens = Math.min(burst, tokens + ((now - last) / 1000) * rate);
      last = now;
      if (tokens >= 1) {
        tokens -= 1;
        return;
      }
      const waitMs = Math.ceil(((1 - tokens) / rate) * 1000);
      await sleep(waitMs);
    }
  }

  return {
    acquire() {
      // Sıraya alarak eşzamanlı çağrıların aynı token'ı tüketmesini engelle.
      const next = chain.then(take);
      chain = next.catch(() => undefined);
      return next;
    },
  };
}

function envRps(): number {
  const raw = Number(process.env.ETSY_RATE_LIMIT_RPS);
  return Number.isFinite(raw) && raw > 0 ? Math.min(raw, 10) : DEFAULT_RPS;
}

export const etsyLimiter: RateLimiter = createRateLimiter({ ratePerSecond: envRps() });

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/* ----------------------------------- fetch ---------------------------------- */

export type EtsyQuery = Record<string, string | number | boolean | undefined | null>;

export type EtsyFetchInit = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  query?: EtsyQuery;
  /** application/x-www-form-urlencoded gövde (Etsy PATCH bunu ister) */
  form?: Record<string, string>;
  json?: unknown;
  /** Authorization: Bearer <token> ekler */
  accessToken?: string;
  timeoutMs?: number;
  maxRetries?: number;
  /** Varsayılan: method === "GET". Sadece idempotent istekler serbestçe tekrarlanır. */
  idempotent?: boolean;
  /** Tam URL (OAuth token uç noktası API_BASE altında değil) */
  absoluteUrl?: string;
  /** x-api-key başlığını atla (OAuth token uç noktası için) */
  skipApiKey?: boolean;
};

function buildUrl(path: string, query: EtsyQuery | undefined, absoluteUrl?: string): string {
  const base = absoluteUrl ?? `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
  if (!query) return base;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    params.append(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

function parseRetryAfter(header: string | null): number | undefined {
  if (!header) return undefined;
  const seconds = Number(header);
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);
  const date = Date.parse(header);
  if (Number.isFinite(date)) return Math.max(0, date - Date.now());
  return undefined;
}

/** Üstel geri çekilme + ±%25 jitter. */
function backoffMs(attempt: number): number {
  const base = 600 * 2 ** attempt;
  const jitter = base * 0.25 * (Math.random() * 2 - 1);
  return Math.round(base + jitter);
}

function extractEtsyMessage(body: unknown): string | null {
  if (typeof body === "string" && body.trim()) return body.slice(0, 300);
  if (body && typeof body === "object") {
    const record = body as Record<string, unknown>;
    for (const key of ["error", "error_description", "message"]) {
      const value = record[key];
      if (typeof value === "string" && value.trim()) return value.slice(0, 300);
    }
  }
  return null;
}

async function readBody(res: Response): Promise<unknown> {
  const text = await res.text().catch(() => "");
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/**
 * Etsy'ye tek bir istek atar.
 *
 * Yeniden deneme kuralı:
 * - Idempotent (GET) istekler: 429, 5xx, ağ hatası ve zaman aşımında tekrar denenir.
 * - Idempotent OLMAYAN (PATCH/POST) istekler: SADECE 429'da tekrar denenir; Etsy
 *   429'da değişikliği kesinlikle uygulamamıştır. 5xx/zaman aşımında ise
 *   `unresolved: true` ile hata fırlatılır — çağıran taraf ilanı yeniden çekip
 *   gerçekte ne olduğunu doğrulamak zorundadır. Körlemesine tekrar denemek
 *   değişikliği iki kez uygulama riski taşır.
 */
export async function etsyFetch<T>(path: string, init: EtsyFetchInit = {}): Promise<T> {
  const method = init.method ?? "GET";
  const idempotent = init.idempotent ?? method === "GET";
  const maxRetries = init.maxRetries ?? (idempotent ? 3 : 1);
  const timeoutMs = init.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  const headers: Record<string, string> = { Accept: "application/json" };

  if (!init.skipApiKey) {
    const apiKey = getEtsyApiKey();
    if (!apiKey) {
      throw new EtsyApiError("missing_key", "ETSY_API_KEY tanımlı değil.");
    }
    headers["x-api-key"] = apiKey;
  }
  if (init.accessToken) headers.Authorization = `Bearer ${init.accessToken}`;

  let body: string | undefined;
  if (init.form) {
    headers["Content-Type"] = "application/x-www-form-urlencoded";
    body = new URLSearchParams(init.form).toString();
  } else if (init.json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(init.json);
  }

  const url = buildUrl(path, init.query, init.absoluteUrl);
  let lastError: EtsyApiError | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    await etsyLimiter.acquire();

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    let res: Response;
    try {
      res = await fetch(url, { method, headers, body, signal: controller.signal });
    } catch (err) {
      const aborted = err instanceof Error && err.name === "AbortError";
      lastError = new EtsyApiError(
        aborted ? "timeout" : "network",
        aborted ? "Etsy isteği zaman aşımına uğradı." : "Etsy'ye bağlanılamadı.",
        { unresolved: !idempotent, cause: err }
      );
      if (!idempotent || attempt === maxRetries) throw lastError;
      await sleep(backoffMs(attempt));
      continue;
    } finally {
      clearTimeout(timer);
    }

    if (res.ok) {
      if (res.status === 204) return undefined as T;
      return (await readBody(res)) as T;
    }

    const parsed = await readBody(res);
    const code = codeFromStatus(res.status);
    const retryAfterMs = parseRetryAfter(res.headers.get("retry-after"));
    const detail = extractEtsyMessage(parsed);

    // 429: Etsy isteği işlememiştir; idempotent olmasa da güvenle tekrarlanabilir.
    const retryable = code === "rate_limited" || (idempotent && res.status >= 500);

    lastError = new EtsyApiError(code, detail ?? `Etsy ${res.status} döndürdü.`, {
      status: res.status,
      body: parsed,
      retryAfterMs,
      unresolved: !idempotent && res.status >= 500,
    });

    if (!retryable || attempt === maxRetries) throw lastError;
    await sleep(retryAfterMs ?? backoffMs(attempt));
  }

  throw lastError ?? new EtsyApiError("server_error", "Etsy isteği başarısız oldu.");
}
