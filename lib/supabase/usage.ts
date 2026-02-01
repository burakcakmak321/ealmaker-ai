import type { SupabaseClient } from "@supabase/supabase-js";

const FREE_LIMIT = 2;

export async function getUsageCount(supabase: SupabaseClient, userId: string): Promise<number> {
  const { data } = await supabase.from("usage").select("count").eq("user_id", userId).single();
  return (data?.count as number) ?? 0;
}

export async function incrementUsage(supabase: SupabaseClient, userId: string): Promise<number> {
  const count = await getUsageCount(supabase, userId);
  const newCount = count + 1;
  await supabase.from("usage").upsert({ user_id: userId, count: newCount }, { onConflict: "user_id" });
  return newCount;
}

export { FREE_LIMIT };
