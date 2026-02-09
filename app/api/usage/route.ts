import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUsageCount, getIsPro, getEffectiveLimit } from "@/lib/supabase/usage";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({
        count: 0,
        remaining: 0,
        limit: 2,
        signedIn: false,
      });
    }
    const admin = createAdminClient();
    const isPro = await getIsPro(admin, user.id);
    const count = await getUsageCount(admin, user.id);
    const limit = await getEffectiveLimit(admin, user.id);
    return NextResponse.json({
      count,
      remaining: isPro ? null : Math.max(0, limit - count),
      limit,
      signedIn: true,
      isPro,
    });
  } catch (err) {
    console.error("Usage API error:", err);
    return NextResponse.json(
      { count: 0, remaining: 0, limit: 2, signedIn: false },
      { status: 200 }
    );
  }
}
