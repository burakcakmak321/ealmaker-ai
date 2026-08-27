/**
 * OAuth token'larını veritabanında şifreli saklamak için AES-256-GCM sarmalayıcı.
 *
 * Bu repoda bir secret manager yok; token'lar Supabase'de duruyor. Bu yüzden
 * anon key sızsa bile token'lar okunamasın diye satır seviyesinde şifreleniyor.
 *
 * Bu modülü kullanan her route `export const runtime = "nodejs"` bildirmelidir
 * (node:crypto Edge runtime'da yoktur).
 */

import { createCipheriv, createDecipheriv, createHash, randomBytes, timingSafeEqual } from "node:crypto";

const VERSION = "v1";
const ALGO = "aes-256-gcm";
const IV_BYTES = 12;
const AAD = Buffer.from("etsy-token-v1");
const MIN_SECRET_LENGTH = 32;

export function hasTokenSecret(): boolean {
  const secret = process.env.ETSY_TOKEN_SECRET?.trim();
  return !!secret && secret.length >= MIN_SECRET_LENGTH;
}

function getKey(): Buffer {
  const secret = process.env.ETSY_TOKEN_SECRET?.trim();
  if (!secret) {
    throw new Error(
      "ETSY_TOKEN_SECRET tanımlı değil. `openssl rand -base64 48` ile üretip .env.local dosyasına ekleyin."
    );
  }
  if (secret.length < MIN_SECRET_LENGTH) {
    throw new Error(
      `ETSY_TOKEN_SECRET en az ${MIN_SECRET_LENGTH} karakter olmalı (şu an ${secret.length}).`
    );
  }
  // Parola serbest uzunlukta olabilir; sabit 32 baytlık anahtara indirger.
  return createHash("sha256").update(secret).digest();
}

function b64url(buf: Buffer): string {
  return buf.toString("base64url");
}

/** Düz metni "v1.<iv>.<tag>.<ciphertext>" biçiminde şifreler. */
export function encryptSecret(plaintext: string): string {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGO, getKey(), iv);
  cipher.setAAD(AAD);
  const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [VERSION, b64url(iv), b64url(tag), b64url(ct)].join(".");
}

/**
 * Şifreli değeri çözer. Sürüm, biçim veya doğrulama etiketi uymazsa hata
 * fırlatır — çağıran taraf bunu "bağlantıyı sil, kullanıcı yeniden bağlansın"
 * olarak ele almalıdır.
 */
export function decryptSecret(payload: string): string {
  const parts = payload.split(".");
  if (parts.length !== 4) {
    throw new Error("Şifreli token biçimi geçersiz.");
  }
  const [version, ivB64, tagB64, ctB64] = parts;
  const expected = Buffer.from(VERSION);
  const actual = Buffer.from(version);
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    throw new Error(`Desteklenmeyen token şifreleme sürümü: ${version}`);
  }

  const iv = Buffer.from(ivB64, "base64url");
  const tag = Buffer.from(tagB64, "base64url");
  const ct = Buffer.from(ctB64, "base64url");
  if (iv.length !== IV_BYTES || tag.length !== 16) {
    throw new Error("Şifreli token bileşenleri bozuk.");
  }

  const decipher = createDecipheriv(ALGO, getKey(), iv);
  decipher.setAAD(AAD);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ct), decipher.final()]).toString("utf8");
}

/** Şifreli değerin bu modülün ürettiği biçimde olup olmadığını söyler. */
export function isEncryptedSecret(value: string | null | undefined): boolean {
  return typeof value === "string" && value.startsWith(`${VERSION}.`) && value.split(".").length === 4;
}
