import { NextResponse } from "next/server";
import { getSupabaseUrl, getSupabaseAnonKey } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

export async function GET() {
  const hasUrl = !!getSupabaseUrl();
  const hasKey = !!getSupabaseAnonKey();
  return NextResponse.json({
    hasUrl,
    hasKey,
    ok: hasUrl && hasKey,
    hint: !hasUrl || !hasKey
      ? "Vercel: SUPABASE_URL ve SUPABASE_ANON_KEY ekleyin (proje Settings > Environment Variables)."
      : null,
  });
}
