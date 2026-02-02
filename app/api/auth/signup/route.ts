import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseUrl, getSupabaseAnonKey } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, password, firstName, lastName } = body;

  if (!email || !password) {
    return NextResponse.json({ ok: false, error: "E-posta ve şifre gerekli" }, { status: 400 });
  }

  const fullName = [firstName, lastName].filter(Boolean).map((s: string) => String(s).trim()).join(" ").trim() || undefined;

  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  if (!url || !key) {
    const host = request.headers.get("host") || "bu site";
    return NextResponse.json(
      { ok: false, error: `${host} için Vercel'de SUPABASE_URL ve SUPABASE_ANON_KEY ekleyin. Projeler → bu domain'i deploy eden proje → Settings → Environment Variables → Add → Redeploy.` },
      { status: 500 }
    );
  }

  const successMessage =
    "Kayıt başarılı. E-posta doğrulama linki gönderildi (gerekirse spam klasörüne bakın). Giriş yapabilirsiniz.";
  const res = NextResponse.json({ ok: true, message: successMessage });
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

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${request.nextUrl.origin}/auth/callback`,
      data: fullName
        ? { full_name: fullName, first_name: (firstName || "").trim(), last_name: (lastName || "").trim() }
        : undefined,
    },
  });

  if (error) {
    const msg =
      error.message === "User already registered"
        ? "Bu e-posta zaten kayıtlı. Giriş yapmayı deneyin."
        : error.message;
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }

  return res;
}
