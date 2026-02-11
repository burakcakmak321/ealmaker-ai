import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getIsPro } from "@/lib/supabase/usage";
import { getTodayActivityCount, FREE_DAILY_LIMIT } from "@/lib/supabase/activity";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({
        count: 0,
        remaining: 3,
        limit: FREE_DAILY_LIMIT,
        signedIn: false,
      });
    }
    const admin = createAdminClient();
    const isPro = await getIsPro(admin, user.id, user.email);
    const count = await getTodayActivityCount(admin, user.id);
    const remaining = isPro ? null : Math.max(0, FREE_DAILY_LIMIT - count);
    return NextResponse.json({
      count,
      remaining,
      limit: FREE_DAILY_LIMIT,
      signedIn: true,
      isPro,
    });
  } catch (err) {
    console.error("Usage API error:", err);
    return NextResponse.json(
      { count: 0, remaining: 3, limit: FREE_DAILY_LIMIT, signedIn: false },
      { status: 200 }
    );
  }
}
