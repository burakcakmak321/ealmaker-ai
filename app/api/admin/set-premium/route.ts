import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { setPremium, isAdminEmail } from "@/lib/supabase/usage";

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
    const type = (body.type as "monthly" | "yearly" | "credits") || "monthly";
    const credits = typeof body.credits === "number" ? Math.max(1, Math.floor(body.credits)) : undefined;
    if (!userId) {
      return NextResponse.json({ error: "userId gerekli." }, { status: 400 });
    }
    const admin = createAdminClient();
    const { data: targetUser } = await admin.auth.admin.getUserById(userId);
    const targetEmail = targetUser?.user?.email;
    if (targetEmail && isAdminEmail(targetEmail)) {
      return NextResponse.json({ error: "Admin hesabına sınırlı premium verilemez." }, { status: 400 });
    }
    await setPremium(admin, userId, type, credits);
    const msg =
      type === "monthly"
        ? "1 aylık Premium verildi."
        : type === "yearly"
          ? "1 yıllık Premium verildi."
          : (credits ?? 0) + " kullanım hakkı verildi.";
    return NextResponse.json({ ok: true, message: msg });
  } catch (err) {
    console.error("Admin set-premium error:", err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}
