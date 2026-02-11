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
        ? await admin.from("usage").select("user_id, is_pro").in("user_id", userIds)
        : { data: [] };
    const proMap = new Map<string, boolean>();
    for (const r of usageRows ?? []) {
      proMap.set((r as { user_id: string; is_pro: boolean }).user_id, !!(r as { is_pro?: boolean }).is_pro);
    }
    const users = (data?.users ?? []).map((u) => ({
      id: u.id,
      email: u.email,
      created_at: u.created_at,
      is_pro: proMap.get(u.id) ?? false,
    }));
    return NextResponse.json({ users });
  } catch (err) {
    console.error("Admin users API error:", err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}
