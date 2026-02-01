import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, password, next: nextPath } = body;

  if (!email || !password) {
    return NextResponse.json({ ok: false, error: "E-posta ve şifre gerekli" }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    const missing = [!url && "NEXT_PUBLIC_SUPABASE_URL", !key && "NEXT_PUBLIC_SUPABASE_ANON_KEY"]
      .filter(Boolean)
      .join(", ");
    return NextResponse.json(
      { ok: false, error: `Vercel env eksik: ${missing}. Settings > Environment Variables kontrol edin.` },
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
