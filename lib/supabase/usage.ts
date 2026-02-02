import type { SupabaseClient } from "@supabase/supabase-js";

const FREE_LIMIT = 2;

export async function getUsageCount(supabase: SupabaseClient, userId: string): Promise<number> {
  const { data } = await supabase.from("usage").select("count").eq("user_id", userId).single();
  return (data?.count as number) ?? 0;
}

export async function getIsPro(supabase: SupabaseClient, userId: string): Promise<boolean> {
  const { data } = await supabase.from("usage").select("is_pro").eq("user_id", userId).single();
  return !!(data as { is_pro?: boolean } | null)?.is_pro;
}

export async function setPro(supabase: SupabaseClient, userId: string, isPro: boolean): Promise<void> {
  await supabase.from("usage").upsert(
    { user_id: userId, count: 0, is_pro: isPro },
    { onConflict: "user_id" }
  );
}

export async function incrementUsage(supabase: SupabaseClient, userId: string): Promise<number> {
  const { data: row } = await supabase.from("usage").select("count, is_pro").eq("user_id", userId).single();
  const count = (row?.count as number) ?? 0;
  const isPro = !!(row as { is_pro?: boolean } | null)?.is_pro;
  const newCount = count + 1;
  await supabase
    .from("usage")
    .upsert({ user_id: userId, count: newCount, is_pro: isPro }, { onConflict: "user_id" });
  return newCount;
}

export { FREE_LIMIT };
