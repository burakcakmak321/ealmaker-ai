import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminAuthenticated } from "@/lib/admin-auth";

/** Türkiye bugün 00:00 ve yarın 00:00 UTC ISO */
function todayBoundsTurkey(): { start: string; end: string } {
  const tr = new Date().toLocaleString("en-CA", { timeZone: "Europe/Istanbul" });
  const [datePart] = tr.split(",");
  const start = new Date(`${datePart}T00:00:00+03:00`);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start: start.toISOString(), end: end.toISOString() };
}

export async function GET() {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });
    }
    const admin = createAdminClient();
    const { start, end } = todayBoundsTurkey();

    const [
      { count: totalActivities },
      { count: todayActivities },
      { data: todayRows },
      { data: authData },
    ] = await Promise.all([
      admin.from("activity_log").select("id", { count: "exact", head: true }),
      admin
        .from("activity_log")
        .select("id", { count: "exact", head: true })
        .gte("created_at", start)
        .lt("created_at", end),
      admin
        .from("activity_log")
        .select("user_id")
        .gte("created_at", start)
        .lt("created_at", end),
      admin.auth.admin.listUsers({ page: 1, perPage: 500 }),
    ]);

    const uniqueToday = new Set((todayRows ?? []).map((r) => (r as { user_id: string }).user_id)).size;

    return NextResponse.json({
      totalRegistrations: authData?.users?.length ?? 0,
      todayActivities: todayActivities ?? 0,
      todayUniqueUsers: uniqueToday,
      totalActivities: totalActivities ?? 0,
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}
