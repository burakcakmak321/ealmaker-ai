import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email || !ADMIN_EMAILS.includes(user.email.toLowerCase())) {
      return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });
    }
    const { searchParams } = new URL(req.url);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "50", 10)));
    const admin = createAdminClient();

    const { data: rows, error } = await admin
      .from("activity_log")
      .select("id, user_id, module, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const userIds = Array.from(new Set((rows ?? []).map((r) => (r as { user_id: string }).user_id)));
    const emailMap = new Map<string, string>();
    if (userIds.length > 0) {
      const { data: users } = await admin.auth.admin.listUsers({ page: 1, perPage: 500 });
      for (const u of users?.users ?? []) {
        if (u.email) emailMap.set(u.id, u.email);
      }
    }

    const activities = (rows ?? []).map((r) => {
      const row = r as { id: string; user_id: string; module: string; created_at: string };
      return {
        id: row.id,
        userId: row.user_id,
        email: emailMap.get(row.user_id) ?? "—",
        module: row.module,
        createdAt: row.created_at,
      };
    });

    return NextResponse.json({ activities });
  } catch (err) {
    console.error("Admin activity error:", err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}
