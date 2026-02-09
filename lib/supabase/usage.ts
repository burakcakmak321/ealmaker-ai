import type { SupabaseClient } from "@supabase/supabase-js";

const FREE_LIMIT = 2;

export async function getUsageCount(supabase: SupabaseClient, userId: string): Promise<number> {
  const { data } = await supabase.from("usage").select("count").eq("user_id", userId).single();
  return (data?.count as number) ?? 0;
}

export async function getOneTimeCredits(supabase: SupabaseClient, userId: string): Promise<number> {
  try {
    const { data, error } = await supabase.from("usage").select("one_time_credits").eq("user_id", userId).single();
    if (error) return 0; // Sütun yoksa veya hata varsa 0 dön
    return (data?.one_time_credits as number) ?? 0;
  } catch {
    return 0;
  }
}

export async function getIsPro(supabase: SupabaseClient, userId: string): Promise<boolean> {
  const { data } = await supabase.from("usage").select("is_pro").eq("user_id", userId).single();
  return !!(data as { is_pro?: boolean } | null)?.is_pro;
}

export async function getEffectiveLimit(supabase: SupabaseClient, userId: string): Promise<number> {
  const credits = await getOneTimeCredits(supabase, userId);
  return FREE_LIMIT + (credits ?? 0);
}

export async function setPro(supabase: SupabaseClient, userId: string, isPro: boolean): Promise<void> {
  await supabase.from("usage").upsert(
    { user_id: userId, count: 0, is_pro: isPro },
    { onConflict: "user_id" }
  );
}

export async function addOneTimeCredits(supabase: SupabaseClient, userId: string, amount: number): Promise<void> {
  try {
    const { data: row } = await supabase.from("usage").select("count, is_pro, one_time_credits").eq("user_id", userId).single();
    const r = row as { count?: number; is_pro?: boolean; one_time_credits?: number } | null;
    const current = r?.one_time_credits ?? 0;
    const { error } = await supabase
      .from("usage")
      .upsert(
        { user_id: userId, count: r?.count ?? 0, is_pro: !!r?.is_pro, one_time_credits: current + amount },
        { onConflict: "user_id" }
      );
    if (error) console.error("addOneTimeCredits:", error);
  } catch (e) {
    console.error("addOneTimeCredits (one_time_credits sütunu yok olabilir - Supabase'de migration çalıştırın):", e);
  }
}

export async function incrementUsage(supabase: SupabaseClient, userId: string): Promise<number> {
  let row: { count?: number; is_pro?: boolean; one_time_credits?: number } | null = null;
  let hasOneTimeColumn = true;
  const r1 = await supabase.from("usage").select("count, is_pro, one_time_credits").eq("user_id", userId).single();
  if (r1.error && /one_time_credits|column|does not exist/i.test(r1.error.message)) {
    hasOneTimeColumn = false;
    const r2 = await supabase.from("usage").select("count, is_pro").eq("user_id", userId).single();
    row = r2.data as typeof row;
  } else {
    row = r1.data as typeof row;
  }
  const count = (row?.count as number) ?? 0;
  const isPro = !!(row as { is_pro?: boolean } | null)?.is_pro;
  const oneTimeCredits = (row?.one_time_credits as number) ?? 0;
  const newCount = count + 1;
  if (hasOneTimeColumn) {
    await supabase
      .from("usage")
      .upsert({ user_id: userId, count: newCount, is_pro: isPro, one_time_credits: oneTimeCredits }, { onConflict: "user_id" });
  } else {
    await supabase.from("usage").upsert({ user_id: userId, count: newCount, is_pro: isPro }, { onConflict: "user_id" });
  }
  return newCount;
}

export { FREE_LIMIT };
