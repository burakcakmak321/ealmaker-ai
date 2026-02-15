import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Oturum açmanız gerekiyor." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const id = (body as { id?: string }).id;
    if (!id) {
      return NextResponse.json({ error: "id gerekli." }, { status: 400 });
    }

    const admin = createAdminClient();
    const { error } = await admin
      .from("user_generations")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Delete generation error:", err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}
