import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

const ADMIN_COOKIE = "admin_session";
const TTL_MS = 24 * 60 * 60 * 1000; // 24 saat

function getSecret(): string {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) return "";
  return secret;
}

/** Admin session token oluştur (HMAC ile imzalı) */
export function createAdminToken(): string {
  const secret = getSecret();
  if (!secret) return "";
  const ts = Date.now().toString();
  const hmac = createHmac("sha256", secret).update(ts).digest("hex");
  return Buffer.from(JSON.stringify({ t: ts, h: hmac })).toString("base64url");
}

/** Admin token doğrula */
export function verifyAdminToken(token: string): boolean {
  const secret = getSecret();
  if (!secret || !token) return false;
  try {
    const raw = Buffer.from(token, "base64url").toString("utf-8");
    const { t, h } = JSON.parse(raw) as { t?: string; h?: string };
    if (!t || !h || typeof t !== "string" || typeof h !== "string") return false;
    const ts = parseInt(t, 10);
    if (isNaN(ts) || Date.now() - ts > TTL_MS) return false;
    const expected = createHmac("sha256", secret).update(t).digest("hex");
    if (expected.length !== h.length) return false;
    return timingSafeEqual(Buffer.from(expected, "utf-8"), Buffer.from(h, "utf-8"));
  } catch {
    return false;
  }
}

/** İstekteki admin cookie'yi doğrula */
export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  return !!token && verifyAdminToken(token);
}

/** Admin cookie adı (set için) */
export const ADMIN_COOKIE_NAME = ADMIN_COOKIE;
