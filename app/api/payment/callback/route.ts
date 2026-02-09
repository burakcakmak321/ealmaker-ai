import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { getIsPro, setPro, addOneTimeCredits } from "@/lib/supabase/usage";
import { PRICES } from "@/lib/pricing";

export const dynamic = "force-dynamic";

const MERCHANT_KEY = process.env.PAYTR_MERCHANT_KEY;
const MERCHANT_SALT = process.env.PAYTR_MERCHANT_SALT;

export async function POST(req: NextRequest) {
  try {
    const body = await req.formData();
    const hash = body.get("hash") as string | null;
    const merchant_oid = body.get("merchant_oid") as string | null;
    const status = body.get("status") as string | null;
    const total_amount = body.get("total_amount") as string | null;

    if (!MERCHANT_KEY || !MERCHANT_SALT || !hash || !merchant_oid) {
      return new NextResponse("OK", { status: 200 });
    }

    // PayTR 2. ADIM callback hash: merchant_oid + merchant_salt + status + total_amount (HMAC-SHA256, merchant_key)
    const hash_str = merchant_oid + MERCHANT_SALT + status + total_amount;
    const expectedHash = createHmac("sha256", MERCHANT_KEY).update(hash_str).digest("base64");

    if (hash !== expectedHash) {
      return new NextResponse("OK", { status: 200 });
    }

    if (status !== "success" || (!merchant_oid.startsWith("pro-") && !merchant_oid.startsWith("onetime-"))) {
      return new NextResponse("OK", { status: 200 });
    }

    const parts = merchant_oid.split("-");
    if (parts.length < 3) return new NextResponse("OK", { status: 200 });
    const plan = parts[0];
    const userId = parts[1];

    const admin = createAdminClient();
    if (plan === "pro") {
      const alreadyPro = await getIsPro(admin, userId);
      if (!alreadyPro) await setPro(admin, userId, true);
    } else if (plan === "onetime") {
      await addOneTimeCredits(admin, userId, PRICES.onetime.credits);
    }

    return new NextResponse("OK", { status: 200 });
  } catch (err) {
    console.error("Payment callback error:", err);
    return new NextResponse("OK", { status: 200 });
  }
}
