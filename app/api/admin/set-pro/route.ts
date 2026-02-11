import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { setPro } from "@/lib/supabase/usage";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });
    }
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const body = await req.json().catch(() => ({}));
    let userId = (body.userId as string)?.trim();
    if (!userId && user?.id) userId = user.id;
    if (!userId) {
      return NextResponse.json(
        { error: "Kendi hesabınız için önce giriş yapın veya userId belirtin." },
        { status: 400 }
      );
    }
    const admin = createAdminClient();
    await setPro(admin, userId, true);
    return NextResponse.json({ ok: true, message: "Premium verildi." });
  } catch (err) {
    console.error("Admin set-pro error:", err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}
