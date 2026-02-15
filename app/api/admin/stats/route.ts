import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

const MODULE_LABELS: Record<string, string> = {
  fatura: "Fatura İtirazı",
  pazarlik: "Pazarlık Mesajı",
  dilekce: "Dilekçe",
  cv: "CV",
  eticaret: "E-Ticaret",
  sosyalmedya: "Sosyal Medya",
  blogseo: "Blog & SEO",
  metin_donusturucu: "Metin Dönüştürücü",
};

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
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email || !ADMIN_EMAILS.includes(user.email.toLowerCase())) {
      return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });
    }
    const admin = createAdminClient();
    const { start, end } = todayBoundsTurkey();

    const [
      resTotal,
      resToday,
      resTodayRows,
      authData,
      resModuleRows,
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
      admin
        .from("activity_log")
        .select("module")
        .gte("created_at", start)
        .lt("created_at", end),
    ]);

    let todayVisitsCount = 0;
    try {
      const resVisits = await admin
        .from("page_visits")
        .select("id", { count: "exact", head: true })
        .gte("created_at", start)
        .lt("created_at", end);
      todayVisitsCount = (resVisits as { count?: number }).count ?? 0;
    } catch {
      // page_visits tablosu yoksa
    }

    const totalActivities = (resTotal as { count?: number }).count ?? 0;
    const todayActivities = (resToday as { count?: number }).count ?? 0;
    const todayRows = (resTodayRows as { data?: { user_id: string }[] }).data;
    const todayModuleRows = (resModuleRows as { data?: { module: string }[] }).data;

    const uniqueToday = new Set((todayRows ?? []).map((r) => (r as { user_id: string }).user_id)).size;

    const moduleCounts: Record<string, number> = {};
    for (const r of todayModuleRows ?? []) {
      const m = (r as { module: string }).module;
      const base = m.startsWith("transform_") ? "metin_donusturucu" : m;
      moduleCounts[base] = (moduleCounts[base] ?? 0) + 1;
    }
    const moduleBreakdown = Object.entries(moduleCounts).map(([mod, cnt]) => ({
      module: mod,
      label: MODULE_LABELS[mod] || mod,
      count: cnt,
    })).sort((a, b) => b.count - a.count);

    return NextResponse.json({
      totalRegistrations: (authData as { data?: { users?: unknown[] } })?.data?.users?.length ?? 0,
      todayActivities: todayActivities ?? 0,
      todayUniqueUsers: uniqueToday,
      totalActivities: totalActivities ?? 0,
      todayVisits: todayVisitsCount,
      moduleBreakdown,
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}
