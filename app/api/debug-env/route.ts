import { NextResponse } from "next/server";
import { getSupabaseUrl, getSupabaseAnonKey } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

export async function GET() {
  const hasUrl = !!getSupabaseUrl();
  const hasKey = !!getSupabaseAnonKey();
  const hasAdminEmails = !!(process.env.ADMIN_EMAILS || "").trim();
  return NextResponse.json({
    hasUrl,
    hasKey,
    hasAdminEmails,
    ok: hasUrl && hasKey,
    hint: !hasUrl || !hasKey
      ? "Vercel: SUPABASE_URL ve SUPABASE_ANON_KEY ekleyin (proje Settings > Environment Variables)."
      : !hasAdminEmails
        ? "ADMIN_EMAILS yok. Proje > Settings > Environment Variables'a ADMIN_EMAILS=burakcakmak321@gmail.com ekleyin."
        : null,
  });
}
