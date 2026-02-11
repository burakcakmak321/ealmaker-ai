import type { SupabaseClient } from "@supabase/supabase-js";

const FREE_LIMIT = 2;

/** Admin e-postaları — sadece bunlar sınırsız */
function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export async function getUsageCount(supabase: SupabaseClient, userId: string): Promise<number> {
  const { data } = await supabase.from("usage").select("count").eq("user_id", userId).single();
  return (data?.count as number) ?? 0;
}

export async function getOneTimeCredits(supabase: SupabaseClient, userId: string): Promise<number> {
  try {
    const { data, error } = await supabase.from("usage").select("one_time_credits").eq("user_id", userId).single();
    if (error) return 0;
    return (data?.one_time_credits as number) ?? 0;
  } catch {
    return 0;
  }
}

/** Admin hesabı her zaman sınırsız */
export function isAdminEmail(email: string | undefined): boolean {
  if (!email) return false;
  return getAdminEmails().includes(email.toLowerCase());
}

/** Sınırsız erişim var mı — sadece admin veya süre/hak ile sınırlı premium */
export async function getHasUnlimitedAccess(
  supabase: SupabaseClient,
  userId: string,
  userEmail?: string
): Promise<boolean> {
  if (userEmail && isAdminEmail(userEmail)) return true;
  const { data } = await supabase
    .from("usage")
    .select("is_pro, pro_expires_at, premium_credits")
    .eq("user_id", userId)
    .single();
  const row = data as { is_pro?: boolean; pro_expires_at?: string | null; premium_credits?: number } | null;
  if (!row) return false;
  if ((row.premium_credits ?? 0) > 0) return true;
  if (row.pro_expires_at) {
    const exp = new Date(row.pro_expires_at).getTime();
    if (exp > Date.now()) return true;
  }
  return false; // is_pro tek başına sınırsız vermez, süre veya hak gerekli
}

/** Geriye uyumluluk için — admin veya geçerli premium */
export async function getIsPro(supabase: SupabaseClient, userId: string, userEmail?: string): Promise<boolean> {
  return getHasUnlimitedAccess(supabase, userId, userEmail);
}

export async function getPremiumCredits(supabase: SupabaseClient, userId: string): Promise<number> {
  try {
    const { data } = await supabase.from("usage").select("premium_credits").eq("user_id", userId).single();
    return (data?.premium_credits as number) ?? 0;
  } catch {
    return 0;
  }
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

/** Premium ver: monthly, yearly veya credits (hak sayısı) */
export async function setPremium(
  supabase: SupabaseClient,
  userId: string,
  type: "monthly" | "yearly" | "credits",
  credits?: number
): Promise<void> {
  const now = new Date();
  let pro_expires_at: string | null = null;
  let premium_credits = 0;
  if (type === "monthly") {
    const d = new Date(now);
    d.setMonth(d.getMonth() + 1);
    pro_expires_at = d.toISOString();
  } else if (type === "yearly") {
    const d = new Date(now);
    d.setFullYear(d.getFullYear() + 1);
    pro_expires_at = d.toISOString();
  } else if (type === "credits" && typeof credits === "number" && credits > 0) {
    premium_credits = credits;
  }
  const { data: row } = await supabase.from("usage").select("count, is_pro, one_time_credits").eq("user_id", userId).single();
  const r = row as { count?: number; is_pro?: boolean; one_time_credits?: number } | null;
  await supabase.from("usage").upsert(
    {
      user_id: userId,
      count: r?.count ?? 0,
      is_pro: true,
      one_time_credits: r?.one_time_credits ?? 0,
      pro_expires_at,
      premium_credits,
    },
    { onConflict: "user_id" }
  );
}

/** Premium geri al */
export async function revokePremium(supabase: SupabaseClient, userId: string): Promise<void> {
  const { data: row } = await supabase.from("usage").select("count, one_time_credits").eq("user_id", userId).single();
  const r = row as { count?: number; one_time_credits?: number } | null;
  await supabase.from("usage").upsert(
    {
      user_id: userId,
      count: r?.count ?? 0,
      is_pro: false,
      one_time_credits: r?.one_time_credits ?? 0,
      pro_expires_at: null,
      premium_credits: 0,
    },
    { onConflict: "user_id" }
  );
}

/** Premium credit kullanıldı — 1 azalt, 0 olunca is_pro=false */
export async function decrementPremiumCredits(supabase: SupabaseClient, userId: string): Promise<void> {
  const { data: row } = await supabase
    .from("usage")
    .select("count, is_pro, one_time_credits, pro_expires_at, premium_credits")
    .eq("user_id", userId)
    .single();
  const r = row as {
    count?: number;
    is_pro?: boolean;
    one_time_credits?: number;
    pro_expires_at?: string | null;
    premium_credits?: number;
  } | null;
  const credits = (r?.premium_credits ?? 0) - 1;
  const newPro = credits > 0 || !!r?.pro_expires_at;
  await supabase.from("usage").upsert(
    {
      user_id: userId,
      count: r?.count ?? 0,
      is_pro: newPro,
      one_time_credits: r?.one_time_credits ?? 0,
      pro_expires_at: r?.pro_expires_at ?? null,
      premium_credits: Math.max(0, credits),
    },
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

type UsageRow = { count?: number; is_pro?: boolean; one_time_credits?: number } | null;

export async function incrementUsage(supabase: SupabaseClient, userId: string): Promise<number> {
  let row: UsageRow = null;
  let hasOneTimeColumn = true;
  const r1 = await supabase.from("usage").select("count, is_pro, one_time_credits").eq("user_id", userId).single();
  if (r1.error && /one_time_credits|column|does not exist/i.test(r1.error.message)) {
    hasOneTimeColumn = false;
    const r2 = await supabase.from("usage").select("count, is_pro").eq("user_id", userId).single();
    row = r2.data as UsageRow;
  } else {
    row = r1.data as UsageRow;
  }
  const count = (row?.count ?? 0) as number;
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
