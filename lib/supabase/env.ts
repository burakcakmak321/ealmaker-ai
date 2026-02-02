/**
 * Supabase URL ve anon key - önce SUPABASE_* (Vercel proje env), yoksa NEXT_PUBLIC_*
 * Böylece Vercel'de sadece SUPABASE_URL + SUPABASE_ANON_KEY eklemen yeterli.
 */
export function getSupabaseUrl(): string | undefined {
  return process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
}

export function getSupabaseAnonKey(): string | undefined {
  return process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}
