import type { SupabaseClient } from "@supabase/supabase-js";

export const FREE_DAILY_LIMIT = 3;
export type ActivityModule = "fatura" | "pazarlik" | "dilekce" | "cv";

/** Türkiye bugün 00:00 ve yarın 00:00 UTC ISO */
function todayBoundsTurkey(): { start: string; end: string } {
  const tr = new Date().toLocaleString("en-CA", { timeZone: "Europe/Istanbul" });
  const [datePart] = tr.split(",");
  const start = new Date(`${datePart}T00:00:00+03:00`);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start: start.toISOString(), end: end.toISOString() };
}

/** Bugün kullanıcının kaç aktivitesi var (Türkiye saati) */
export async function getTodayActivityCount(
  supabase: SupabaseClient,
  userId: string
): Promise<number> {
  const { start, end } = todayBoundsTurkey();
  const { count, error } = await supabase
    .from("activity_log")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", start)
    .lt("created_at", end);
  if (error) return 0;
  return count ?? 0;
}

/** Aktivite ekle (generate başarılı sonrası) */
export async function logActivity(
  supabase: SupabaseClient,
  userId: string,
  module: ActivityModule
): Promise<void> {
  await supabase.from("activity_log").insert({
    user_id: userId,
    module,
    created_at: new Date().toISOString(),
  });
}
