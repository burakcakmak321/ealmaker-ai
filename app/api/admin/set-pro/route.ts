import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { setPro } from "@/lib/supabase/usage";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.email || !ADMIN_EMAILS.includes(user.email.toLowerCase())) {
      return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });
    }
    const body = await req.json().catch(() => ({}));
    const userId = (body.userId as string)?.trim() || user.id;
    const admin = createAdminClient();
    await setPro(admin, userId, true);
    return NextResponse.json({ ok: true, message: "Pro verildi." });
  } catch (err) {
    console.error("Admin set-pro error:", err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}
