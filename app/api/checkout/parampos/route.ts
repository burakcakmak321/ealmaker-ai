import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PRICES } from "@/lib/pricing";
import { tpWmdUcd, formatAmount, isParamPosConfigured } from "@/lib/parampos";

export const dynamic = "force-dynamic";

/** GSM: 10 hane, başında 0 olmadan */
function normalizeGsm(gsm: string): string {
  const digits = gsm.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  if (digits.length === 10) return digits;
  return digits.slice(-10);
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Giriş yapmanız gerekiyor." }, { status: 401 });
    }

    if (!isParamPosConfigured()) {
      return NextResponse.json(
        { error: "ParamPOS yapılandırılmadı. PARAMPOS_CLIENT_CODE, PARAMPOS_CLIENT_USERNAME, PARAMPOS_CLIENT_PASSWORD, PARAMPOS_GUID ekleyin." },
        { status: 503 }
      );
    }

    const body = await req.json().catch(() => ({})) as {
      plan?: string;
      kkSahibi?: string;
      kkNo?: string;
      kkSkAy?: string;
      kkSkYil?: string;
      kkCvc?: string;
      kkSahibiGsm?: string;
    };

    const plan = body.plan === "onetime" ? "onetime" : "pro";
    const amount = plan === "onetime" ? PRICES.onetime.discounted : PRICES.pro.discounted;
    const islemTutar = formatAmount(amount);
    const toplamTutar = islemTutar; // Komisyon 0 kabul

    const kkSahibi = (body.kkSahibi || "").trim().slice(0, 100);
    const kkNo = (body.kkNo || "").replace(/\s/g, "").slice(0, 16);
    const kkSkAy = (body.kkSkAy || "").replace(/\D/g, "").slice(0, 2).padStart(2, "0");
    const kkSkYil = (body.kkSkYil || "").replace(/\D/g, "").slice(-4);
    const kkCvc = (body.kkCvc || "").replace(/\D/g, "").slice(0, 3);
    const kkSahibiGsm = normalizeGsm(body.kkSahibiGsm || "");

    if (!kkSahibi || !kkNo || kkNo.length < 15 || !kkSkAy || !kkSkYil || kkCvc.length < 3 || kkSahibiGsm.length !== 10) {
      return NextResponse.json(
        { error: "Kart bilgileri eksik veya geçersiz. Ad soyad, kart numarası, son kullanma tarihi, CVC ve 10 haneli GSM gerekli." },
        { status: 400 }
      );
    }

    const origin = req.nextUrl.origin;
    const siparisId = `${plan}-${user.id}-${Date.now()}`;
    const basariliUrl = `${origin}/api/payment/parampos/success`;
    const hataUrl = `${origin}/api/payment/parampos/fail`;
    const refUrl = `${origin}/odeme/checkout?plan=${plan}`;
    const userIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "127.0.0.1";
    const siparisAciklama = plan === "pro" ? PRICES.pro.label : PRICES.onetime.label;

    const result = await tpWmdUcd({
      plan,
      siparisId,
      islemTutar,
      toplamTutar,
      basariliUrl,
      hataUrl,
      ipAdr: userIp,
      refUrl,
      kkSahibi,
      kkNo,
      kkSkAy,
      kkSkYil,
      kkCvc,
      kkSahibiGsm,
      siparisAciklama,
    });

    if (result.sonuc <= 0) {
      return NextResponse.json(
        { error: result.sonucStr || "Ödeme başlatılamadı." },
        { status: 502 }
      );
    }

    // 3D için UCD_HTML dön; NONSECURE ise (NS işlem) burada tahsilat tamamlanmış olur (callback'a gitmeden)
    if (result.ucdHtml === "NONSECURE") {
      return NextResponse.json(
        { error: "Güvenli ödeme (3D) kullanılmalı. Lütfen 3D Secure destekli kart deneyin." },
        { status: 400 }
      );
    }

    if (!result.ucdHtml) {
      return NextResponse.json(
        { error: result.sonucStr || "Banka yanıtı alınamadı." },
        { status: 502 }
      );
    }

    return NextResponse.json({ ucdHtml: result.ucdHtml, siparisId });
  } catch (err) {
    console.error("ParamPOS checkout error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Ödeme başlatılamadı." },
      { status: 500 }
    );
  }
}
