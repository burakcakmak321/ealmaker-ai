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
        ? "ADMIN_PASSWORD yok. GitHub'daki ADMIN-SETUP.md dosyasindaki adimlari takip edin: Proje > Settings > Environment Variables, ADMIN_PASSWORD ekleyin, Redeploy."
        : null,
  });
}
