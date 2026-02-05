import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createHmac } from "crypto";

export const dynamic = "force-dynamic";

const PRO_AMOUNT_CENTS = 2450; // 24,50 TL (YENI2026 indirimli)
const MERCHANT_ID = process.env.PAYTR_MERCHANT_ID;
const MERCHANT_KEY = process.env.PAYTR_MERCHANT_KEY;
const MERCHANT_SALT = process.env.PAYTR_MERCHANT_SALT;

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Giriş yapmanız gerekiyor." }, { status: 401 });
    }

    if (!MERCHANT_ID || !MERCHANT_KEY || !MERCHANT_SALT) {
      return NextResponse.json(
        { error: "Ödeme altyapısı henüz yapılandırılmadı. PAYTR_MERCHANT_ID, PAYTR_MERCHANT_KEY, PAYTR_MERCHANT_SALT ekleyin." },
        { status: 503 }
      );
    }

    const origin = req.nextUrl.origin;
    const merchant_oid = `pro-${user.id}-${Date.now()}`;
    const user_name = (user.user_metadata?.full_name as string) || user.email?.split("@")[0] || "Kullanıcı";
    const user_email = user.email || "";
    const user_ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "127.0.0.1";
    const test_mode = process.env.PAYTR_TEST_MODE === "1" ? "1" : "0";
    const currency = "TL";
    const no_installment = "1";
    const max_installment = "0";
    const user_basket = Buffer.from(JSON.stringify([["Pro Aylık Abonelik", "24.50", "1"]])).toString("base64");

    // PayTR 1. ADIM hash: merchant_id + user_ip + merchant_oid + email + payment_amount + user_basket + no_installment + max_installment + currency + test_mode + merchant_salt
    // HMAC-SHA256 ile merchant_key kullanılır (https://dev.paytr.com/iframe-api/iframe-api-1-adim)
    const hash_str = [
      MERCHANT_ID,
      user_ip,
      merchant_oid,
      user_email,
      String(PRO_AMOUNT_CENTS),
      user_basket,
      no_installment,
      max_installment,
      currency,
      test_mode,
      MERCHANT_SALT,
    ].join("");
    const paytr_token = createHmac("sha256", MERCHANT_KEY).update(hash_str).digest("base64");

    const form = new URLSearchParams({
      merchant_id: MERCHANT_ID,
      merchant_key: MERCHANT_KEY,
      merchant_salt: MERCHANT_SALT,
      user_ip,
      merchant_oid,
      email: user_email,
      payment_amount: String(PRO_AMOUNT_CENTS),
      paytr_token,
      user_basket,
      debug_on: "0",
      no_installment,
      max_installment,
      user_name: user_name.substring(0, 50),
      user_address: "Türkiye",
      user_phone: (user.user_metadata?.phone as string) || "05550000000",
      merchant_ok_url: `${origin}/odeme/basarili`,
      merchant_fail_url: `${origin}/odeme/iptal`,
      timeout_limit: "30",
      currency,
      test_mode,
    });

    const res = await fetch("https://www.paytr.com/odeme/api/get-token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
    });

    const text = await res.text();
    const data = JSON.parse(text) as { status?: string; token?: string; reason?: string };

    if (data.status !== "success" || !data.token) {
      console.error("PayTR get-token error:", data);
      return NextResponse.json(
        { error: data.reason || "Ödeme token alınamadı." },
        { status: 502 }
      );
    }

    return NextResponse.json({ token: data.token });
  } catch (err) {
    console.error("Checkout API error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Ödeme başlatılamadı." },
      { status: 500 }
    );
  }
}
