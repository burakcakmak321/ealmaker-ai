import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createHash } from "crypto";

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

    const hash_str = [
      MERCHANT_ID,
      user_ip,
      merchant_oid,
      user_email,
      PRO_AMOUNT_CENTS,
      "TL",
      MERCHANT_SALT,
    ].join("");

    const paytr_token = createHash("sha256").update(hash_str).digest("base64");

    const form = new URLSearchParams({
      merchant_id: MERCHANT_ID,
      user_ip,
      merchant_oid,
      email: user_email,
      payment_amount: String(PRO_AMOUNT_CENTS),
      paytr_token,
      user_basket: Buffer.from(JSON.stringify([["Pro Aylık Abonelik", "24.50", "1"]])).toString("base64"),
      debug_on: "0",
      no_installment: "1",
      max_installment: "0",
      user_name: user_name.substring(0, 50),
      user_address: "Türkiye",
      user_phone: "0000000000",
      merchant_ok_url: `${origin}/odeme/basarili`,
      merchant_fail_url: `${origin}/odeme/iptal`,
      timeout_limit: "30",
      currency: "TL",
      test_mode: process.env.PAYTR_TEST_MODE === "1" ? "1" : "0",
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
