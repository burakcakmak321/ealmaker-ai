import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email || !ADMIN_EMAILS.includes(user.email.toLowerCase())) {
      return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });
    }
    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 500 });
    if (error) {
      console.error("Admin listUsers error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    const userIds = (data?.users ?? []).map((u) => u.id);
    const { data: usageRows } =
      userIds.length > 0
        ? await admin.from("usage").select("user_id, is_pro, pro_expires_at, premium_credits").in("user_id", userIds)
        : { data: [] };
    const usageMap = new Map<
      string,
      { is_pro: boolean; pro_expires_at: string | null; premium_credits: number }
    >();
    for (const r of usageRows ?? []) {
      const row = r as { user_id: string; is_pro?: boolean; pro_expires_at?: string | null; premium_credits?: number };
      usageMap.set(row.user_id, {
        is_pro: !!row.is_pro,
        pro_expires_at: row.pro_expires_at ?? null,
        premium_credits: row.premium_credits ?? 0,
      });
    }
    const users = (data?.users ?? []).map((u) => {
      const usage = usageMap.get(u.id);
      const isAdmin = u.email ? ADMIN_EMAILS.includes(u.email.toLowerCase()) : false;
      const proExpiresAt = usage?.pro_expires_at ?? null;
      const premiumCredits = usage?.premium_credits ?? 0;
      const hasActivePremium =
        isAdmin ||
        (!!usage?.is_pro && (premiumCredits > 0 || (proExpiresAt && new Date(proExpiresAt) > new Date())));
      return {
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        is_pro: hasActivePremium,
        is_admin: isAdmin,
        pro_expires_at: proExpiresAt,
        premium_credits: premiumCredits,
      };
    });
    return NextResponse.json({ users });
  } catch (err) {
    console.error("Admin users API error:", err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}
