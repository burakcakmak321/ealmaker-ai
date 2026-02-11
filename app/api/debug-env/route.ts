import { NextResponse } from "next/server";
import { getSupabaseUrl, getSupabaseAnonKey } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

export async function GET() {
  const hasUrl = !!getSupabaseUrl();
  const hasKey = !!getSupabaseAnonKey();
  const hasAdminPassword = !!process.env.ADMIN_PASSWORD;
  return NextResponse.json({
    hasUrl,
    hasKey,
    hasAdminPassword,
    ok: hasUrl && hasKey,
    hint: !hasUrl || !hasKey
      ? "Vercel: SUPABASE_URL ve SUPABASE_ANON_KEY ekleyin (proje Settings > Environment Variables)."
      : !hasAdminPassword
        ? "ADMIN_PASSWORD tanimli degil. Vercel'de ealmaker-ai PROJESININ Settings > Environment Variables sayfasina gidin (Team degil, proje ayarlari), ADMIN_PASSWORD ekleyin, Redeploy yapin."
        : null,
  });
}
