import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const body = (await req.json().catch(() => ({}))) as { path?: string };
    const path = typeof body.path === "string" ? body.path.slice(0, 500) : "/";

    const admin = createAdminClient();
    await admin.from("page_visits").insert({
      user_id: user?.id ?? null,
      path,
      created_at: new Date().toISOString(),
    });
  } catch {
    // Sessizce geç - tablo yoksa veya hata olursa
  }
  return NextResponse.json({ ok: true });
}
