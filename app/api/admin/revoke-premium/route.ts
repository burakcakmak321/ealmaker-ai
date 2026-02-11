import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revokePremium, isAdminEmail } from "@/lib/supabase/usage";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email || !ADMIN_EMAILS.includes(user.email.toLowerCase())) {
      return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });
    }
    const body = await req.json().catch(() => ({}));
    const userId = (body.userId as string)?.trim();
    if (!userId) {
      return NextResponse.json({ error: "userId gerekli." }, { status: 400 });
    }
    const admin = createAdminClient();
    const { data: targetUser } = await admin.auth.admin.getUserById(userId);
    const targetEmail = targetUser?.user?.email;
    if (targetEmail && isAdminEmail(targetEmail)) {
      return NextResponse.json({ error: "Admin hesabından Premium geri alınamaz." }, { status: 400 });
    }
    await revokePremium(admin, userId);
    return NextResponse.json({ ok: true, message: "Premium geri alındı." });
  } catch (err) {
    console.error("Admin revoke-premium error:", err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}
