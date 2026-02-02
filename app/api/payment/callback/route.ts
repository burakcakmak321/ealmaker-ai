import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { setPro } from "@/lib/supabase/usage";

export const dynamic = "force-dynamic";

const MERCHANT_SALT = process.env.PAYTR_MERCHANT_SALT;

export async function POST(req: NextRequest) {
  try {
    const body = await req.formData();
    const hash = body.get("hash") as string | null;
    const merchant_oid = body.get("merchant_oid") as string | null;
    const status = body.get("status") as string | null;
    const total_amount = body.get("total_amount") as string | null;

    if (!MERCHANT_SALT || !hash || !merchant_oid) {
      return new NextResponse("OK", { status: 200 });
    }

    const token_str = [
      merchant_oid,
      body.get("status"),
      body.get("total_amount"),
      body.get("hash"),
      MERCHANT_SALT,
    ].join("");

    const expectedHash = createHash("sha256").update(token_str).digest("base64");

    if (hash !== expectedHash) {
      return new NextResponse("OK", { status: 200 });
    }

    if (status !== "success" || !merchant_oid.startsWith("pro-")) {
      return new NextResponse("OK", { status: 200 });
    }

    const parts = merchant_oid.split("-");
    if (parts.length < 3) return new NextResponse("OK", { status: 200 });
    const userId = parts[1];

    const admin = createAdminClient();
    await setPro(admin, userId, true);

    return new NextResponse("OK", { status: 200 });
  } catch (err) {
    console.error("Payment callback error:", err);
    return new NextResponse("OK", { status: 200 });
  }
}
