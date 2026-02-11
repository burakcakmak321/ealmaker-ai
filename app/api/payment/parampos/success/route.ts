import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getIsPro, setPremium, addOneTimeCredits } from "@/lib/supabase/usage";
import { PRICES } from "@/lib/pricing";
import { tpWmdPay, verifyCallbackHash, isParamPosConfigured } from "@/lib/parampos";

export const dynamic = "force-dynamic";

/**
 * ParamPOS 3D başarılı dönüş - banka bu URL'e POST yapar.
 * md, mdStatus, orderId, islemGUID, islemHash, transactionAmount
 * mdStatus 1,2,3,4 ise TP_WMD_Pay ile tahsilatı tamamla, sonra plan'a göre usage güncelle ve /odeme/basarili'a yönlendir.
 */
export async function POST(req: NextRequest) {
  const origin = req.nextUrl.origin;
  const basariliUrl = `${origin}/odeme/basarili`;
  const iptalUrl = `${origin}/odeme/iptal`;

  try {
    const formData = await req.formData().catch(() => new FormData());
    const md = (formData.get("md") as string) || "";
    const mdStatus = String(formData.get("mdStatus") ?? "");
    const orderId = (formData.get("orderId") as string) || "";
    const islemGUID = (formData.get("islemGUID") as string) || "";
    const islemHash = (formData.get("islemHash") as string) || "";

    if (!orderId || !islemGUID || !md) {
      return NextResponse.redirect(iptalUrl);
    }

    if (!isParamPosConfigured()) {
      return NextResponse.redirect(iptalUrl);
    }

    const guid = process.env.PARAMPOS_GUID!;
    const expectedHash = verifyCallbackHash(islemGUID, md, mdStatus, orderId, guid);
    if (expectedHash !== islemHash) {
      return NextResponse.redirect(iptalUrl);
    }

    const statusNum = parseInt(mdStatus, 10);
    if (![1, 2, 3, 4].includes(statusNum)) {
      return NextResponse.redirect(iptalUrl);
    }

    const payResult = await tpWmdPay(md, islemGUID, orderId);
    if (payResult.sonuc <= 0 || payResult.dekontId <= 0 || payResult.bankaSonucKod !== 0) {
      return NextResponse.redirect(iptalUrl);
    }

    const parts = orderId.split("-");
    if (parts.length < 3) return NextResponse.redirect(iptalUrl);
    const plan = parts[0];
    const userId = parts[1];

    const admin = createAdminClient();
    if (plan === "pro") {
      const alreadyPro = await getIsPro(admin, userId);
      if (!alreadyPro) await setPremium(admin, userId, "monthly");
    } else if (plan === "onetime") {
      await addOneTimeCredits(admin, userId, PRICES.onetime.credits);
    }

    const planParam = plan === "onetime" ? "onetime" : "pro";
    return NextResponse.redirect(`${basariliUrl}?plan=${planParam}`);
  } catch (err) {
    console.error("ParamPOS success callback error:", err);
    return NextResponse.redirect(iptalUrl);
  }
}
