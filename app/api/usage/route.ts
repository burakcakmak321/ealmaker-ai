import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUsageCount, FREE_LIMIT } from "@/lib/supabase/usage";

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
        limit: FREE_LIMIT,
        signedIn: false,
      });
    }
    const admin = createAdminClient();
    const count = await getUsageCount(admin, user.id);
    return NextResponse.json({
      count,
      remaining: Math.max(0, FREE_LIMIT - count),
      limit: FREE_LIMIT,
      signedIn: true,
    });
  } catch (err) {
    console.error("Usage API error:", err);
    return NextResponse.json(
      { count: 0, remaining: 0, limit: FREE_LIMIT, signedIn: false },
      { status: 200 }
    );
  }
}
