import { NextRequest, NextResponse } from "next/server";
import { createAdminToken, ADMIN_COOKIE_NAME } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const password = (body.password as string)?.trim() ?? "";
    const expected = process.env.ADMIN_PASSWORD ?? "";
    if (!expected) {
      return NextResponse.json({ error: "Admin şifresi yapılandırılmamış." }, { status: 500 });
    }
    if (password !== expected) {
      return NextResponse.json({ error: "Geçersiz şifre." }, { status: 401 });
    }
    const token = createAdminToken();
    const res = NextResponse.json({ ok: true });
    res.cookies.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60,
      path: "/",
    });
    return res;
  } catch (err) {
    console.error("Admin login error:", err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}
