import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const MODULE_LABELS: Record<string, string> = {
  fatura: "Fatura İtirazı",
  pazarlik: "Pazarlık Mesajı",
  dilekce: "Dilekçe",
  cv: "CV",
  eticaret: "E-Ticaret",
  sosyalmedya: "Sosyal Medya",
  blogseo: "Blog & SEO",
};

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Oturum açmanız gerekiyor." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));

    const admin = createAdminClient();
    const { data, error } = await admin
      .from("user_generations")
      .select("id, module, title, input_preview, output_text, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      const msg = /does not exist|schema cache|user_generations/i.test(error.message)
        ? "Veritabanı tablosu henüz oluşturulmamış. Supabase'de supabase-admin-extended.sql dosyasını çalıştırın."
        : error.message;
      return NextResponse.json({ error: msg, code: "TABLE_NOT_FOUND" }, { status: 500 });
    }

    const items = (data ?? []).map((r) => ({
      id: r.id,
      module: r.module,
      moduleLabel: MODULE_LABELS[r.module] || r.module,
      title: r.title,
      inputPreview: r.input_preview,
      outputText: r.output_text,
      createdAt: r.created_at,
    }));

    return NextResponse.json({ generations: items });
  } catch (err) {
    console.error("User generations error:", err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}
