/**
 * Etsy modülünün hata tipleri.
 *
 * Kural: kullanıcıya giden her mesaj Türkçe'dir ve `toTurkishMessage()`
 * üzerinden üretilir. Ham Etsy/fetch hataları hiçbir zaman doğrudan
 * arayüze sızmaz.
 */

export type EtsyErrorCode =
  | "missing_key"
  | "missing_connection"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "rate_limited"
  | "quota_exceeded"
  | "invalid_request"
  | "server_error"
  | "network"
  | "timeout"
  | "validation";

type EtsyApiErrorOptions = {
  status?: number;
  body?: unknown;
  retryAfterMs?: number;
  /**
   * PATCH gibi idempotent olmayan bir istek zaman aşımına uğradığında veya 5xx
   * aldığında true olur: Etsy değişikliği uygulamış da olabilir, uygulamamış da.
   * Çağıran taraf körlemesine tekrar denemek yerine ilanı yeniden çekip
   * doğrulamak zorundadır.
   */
  unresolved?: boolean;
  cause?: unknown;
};

export class EtsyApiError extends Error {
  readonly code: EtsyErrorCode;
  readonly status: number;
  readonly body?: unknown;
  readonly retryAfterMs?: number;
  readonly unresolved: boolean;

  constructor(code: EtsyErrorCode, message: string, opts: EtsyApiErrorOptions = {}) {
    super(message, opts.cause !== undefined ? { cause: opts.cause } : undefined);
    this.name = "EtsyApiError";
    this.code = code;
    this.status = opts.status ?? 0;
    this.body = opts.body;
    this.retryAfterMs = opts.retryAfterMs;
    this.unresolved = opts.unresolved ?? false;
  }
}

/** Doğrulama katmanı engelleyici hata bulduğunda fırlatılır. */
export class EtsyValidationError extends Error {
  readonly issues: unknown[];

  constructor(message: string, issues: unknown[]) {
    super(message);
    this.name = "EtsyValidationError";
    this.issues = issues;
  }
}

/** HTTP durum kodunu bizim hata koduna eşler. */
export function codeFromStatus(status: number): EtsyErrorCode {
  if (status === 400 || status === 422) return "invalid_request";
  if (status === 401) return "unauthorized";
  if (status === 403) return "forbidden";
  if (status === 404) return "not_found";
  if (status === 429) return "rate_limited";
  if (status >= 500) return "server_error";
  return "invalid_request";
}

const TURKISH_MESSAGES: Record<EtsyErrorCode, string> = {
  missing_key:
    "Etsy API anahtarı sunucuda tanımlı değil. .env.local dosyasına ETSY_API_KEY ekleyin.",
  missing_connection:
    "Etsy mağazanız bağlı değil. Önce “Mağazamı Bağla” ile yetki verin.",
  unauthorized:
    "Etsy yetkilendirmesi geçersiz veya süresi dolmuş. Mağazanızı yeniden bağlayın.",
  forbidden:
    "Etsy bu işlem için yetki vermedi. Uygulama izinlerini (scope) kontrol edin.",
  not_found: "İlan veya mağaza Etsy'de bulunamadı.",
  rate_limited:
    "Etsy istek sınırına takıldık. Birkaç saniye sonra tekrar deneyin.",
  quota_exceeded:
    "Günlük Etsy istek kotası doldu. Yarın tekrar deneyebilirsiniz.",
  invalid_request:
    "Etsy isteği geçersiz bulundu. Girdiğiniz bilgileri kontrol edin.",
  server_error: "Etsy tarafında geçici bir hata oluştu. Lütfen tekrar deneyin.",
  network: "Etsy'ye bağlanılamadı. İnternet bağlantınızı kontrol edin.",
  timeout: "Etsy zamanında yanıt vermedi. Lütfen tekrar deneyin.",
  validation:
    "Üretilen içerik Etsy kurallarına uymadı ve güvenlik gereği uygulanmadı.",
};

/** Herhangi bir hatayı kullanıcıya gösterilebilir Türkçe cümleye çevirir. */
export function toTurkishMessage(err: unknown): string {
  if (err instanceof EtsyApiError) {
    if (err.unresolved) {
      return "Etsy yanıt vermedi; ilanın son durumu kontrol ediliyor. Geçmiş ekranından doğrulayın.";
    }
    return TURKISH_MESSAGES[err.code];
  }
  if (err instanceof EtsyValidationError) return TURKISH_MESSAGES.validation;
  return "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.";
}

/** Hata kodunu bizim API route'larımızın döndüreceği HTTP durumuna eşler. */
export function toHttpStatus(err: unknown): number {
  if (err instanceof EtsyValidationError) return 422;
  if (!(err instanceof EtsyApiError)) return 500;
  switch (err.code) {
    case "missing_key":
    case "missing_connection":
      return 409;
    case "unauthorized":
      return 401;
    case "forbidden":
      return 403;
    case "not_found":
      return 404;
    case "rate_limited":
    case "quota_exceeded":
      return 429;
    case "invalid_request":
    case "validation":
      return 422;
    default:
      return 502;
  }
}
