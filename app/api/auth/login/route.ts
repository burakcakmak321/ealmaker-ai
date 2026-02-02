import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseUrl, getSupabaseAnonKey } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, password, next: nextPath } = body;

  if (!email || !password) {
    return NextResponse.json({ ok: false, error: "E-posta ve şifre gerekli" }, { status: 400 });
  }

  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  if (!url || !key) {
    return NextResponse.json(
      { ok: false, error: "Vercel'de SUPABASE_URL ve SUPABASE_ANON_KEY ekleyin (Settings > Environment Variables)." },
      { status: 500 }
    );
  }

  const redirectTo = nextPath || "/";
  const res = NextResponse.json({ ok: true, redirect: redirectTo });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
      },
    },
  });

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 401 });
  }

  return res;
}
