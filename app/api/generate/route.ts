import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUsageCount, getIsPro, getEffectiveLimit, incrementUsage } from "@/lib/supabase/usage";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

type ModuleType = "fatura" | "pazarlik" | "dilekce" | "cv";

function buildSystemPrompt(type: ModuleType, payload: Record<string, unknown>): string {
  switch (type) {
    case "fatura": {
      const kurum = (payload.kurum as string) || "kurum";
      const konu = (payload.konu as string) || "fatura itirazı";
      const detay = (payload.detay as string) || "";
      return `Sen Türkiye'de hukuki ve resmi yazışmalarda uzman bir asistansın. Kullanıcı bir fatura veya abonelik itirazı yazmak istiyor.
Kurum: ${kurum}
Konu: ${konu}
Ek detay: ${detay}

Görevin: Bu kuruma hitaben, kibarca ama net ve ikna edici bir dilekçe/mesaj metni yaz. Hukuki jargonu yerinde kullan, Tüketici Kanunu ve ilgili mevzuata atıf yapabilirsin. Talebi (indirim, iade, iptal vb.) açıkça belirt. Metni doğrudan kullanıcının kopyalayıp gönderebileceği şekilde, hitap ile başlayıp saygıyla bitir. Sadece metni yaz, ek açıklama ekleme.`;
    }
    case "pazarlik": {
      const platform = (payload.platform as string) || "ikinci el platform";
      const urun = (payload.urun as string) || "ürün";
      const fiyat = (payload.fiyat as string) || "belirtilmemiş";
      const hedefFiyat = (payload.hedefFiyat as string) || "";
      return `Sen ikinci el / e-ticaret pazarlığında usta bir asistansın. Kullanıcı satıcıya mesaj atacak.
Platform: ${platform}
Ürün: ${urun}
İlan fiyatı: ${fiyat}
Hedef fiyat (varsa): ${hedefFiyat}

Görevin: Satıcıyı kırmadan, saygılı ama kararlı 3 kısa mesaj hazırla. İlk mesaj selam + ilgi, ikinci mesaj fiyat teklifi veya soru, üçüncü mesaj (gerekirse) son teklif veya teşekkür. Türkçe, samimi ama pazarlık niyetini belli eden bir dil kullan. Mesajları "1." "2." "3." diye numaralandır. Sadece mesajları yaz.`;
    }
    case "dilekce": {
      const baslik = (payload.baslik as string) || "Dilekçe";
      const konu = (payload.konu as string) || "";
      const detay = (payload.detay as string) || "";
      return `Sen Türkiye'de resmi dilekçe yazımında uzman bir asistansın. Kullanıcı bir dilekçe metni istiyor.
Dilekçe türü/başlık: ${baslik}
Konu: ${konu}
Kullanıcının anlattığı detay: ${detay}

Görevin: Resmi dilekçe formatında (Sayı, Tarih, İlgi, Metin, Talep, Saygıyla) tam bir dilekçe metni yaz. 657 sayılı DMK ve dilekçe usulüne uygun olsun. İmza ve tarih için boşluk bırak. Sadece dilekçe metnini yaz.`;
    }
    case "cv": {
      const adSoyad = (payload.adSoyad as string) || "Kullanıcı";
      const hedefPozisyon = (payload.hedefPozisyon as string) || "Belirtilmedi";
      const ozet = (payload.ozet as string) || "";
      const deneyim = (payload.deneyim as string) || "";
      const egitim = (payload.egitim as string) || "";
      const beceriler = (payload.beceriler as string) || "";
      const dil = (payload.dil as string) || "";
      return `Sen insan kaynakları ve kariyer danışmanlığında deneyimli bir asistansın. Kullanıcı CV (öz geçmiş) taslağı istiyor.

Ad Soyad: ${adSoyad}
Hedef pozisyon: ${hedefPozisyon}
Profesyonel özet: ${ozet}
İş deneyimi: ${deneyim}
Eğitim: ${egitim}
Beceriler: ${beceriler}
Diller: ${dil}

Görevin: Profesyonel, ATS dostu ve okunabilir bir CV metni taslağı oluştur. Başlık (Ad Soyad), Profesyonel Özet, İş Deneyimi, Eğitim, Beceriler ve Diller bölümlerini içeren düz metin formatında yaz. Madde işaretleri kullan, net ve öz ifadeler tercih et. Sadece CV içeriğini yaz, ek açıklama ekleme.`;
    }
    default:
      return "Genel metin üret.";
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Oturum açmanız gerekiyor.", requiresAuth: true },
        { status: 401 }
      );
    }

    const admin = createAdminClient();
    const isPro = await getIsPro(admin, user.id);
    if (!isPro) {
      const count = await getUsageCount(admin, user.id);
      const limit = await getEffectiveLimit(admin, user.id);
      if (count >= limit) {
        return NextResponse.json(
          { error: "Kullanım hakkınız doldu. Tek seferlik paket veya Pro'ya geçin.", limitReached: true },
          { status: 402 }
        );
      }
    }

    const body = await req.json();
    const { type, ...payload } = body as { type: ModuleType; [k: string]: unknown };

    if (!type || !["fatura", "pazarlik", "dilekce", "cv"].includes(type)) {
      return NextResponse.json(
        { error: "Geçersiz modül. type: fatura | pazarlik | dilekce | cv" },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          error:
            "Sunucuda OPENAI_API_KEY tanımlı değil. .env.local dosyasına ekleyin.",
        },
        { status: 500 }
      );
    }

    const systemPrompt = buildSystemPrompt(type, payload);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content:
            type === "fatura"
              ? "Fatura/itiraz dilekçesini yaz."
              : type === "pazarlik"
                ? "Pazarlık mesajlarını yaz."
                : type === "cv"
                  ? "CV taslağını oluştur."
                  : "Dilekçe metnini yaz.",
        },
      ],
      max_tokens: 1500,
    });

    const text =
      completion.choices[0]?.message?.content?.trim() ||
      "Metin oluşturulamadı. Lütfen tekrar dene.";

    await incrementUsage(admin, user.id);

    return NextResponse.json({ text });
  } catch (err) {
    console.error("Generate API error:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "AI yanıtı alınamadı. API anahtarını kontrol et.",
      },
      { status: 500 }
    );
  }
}
