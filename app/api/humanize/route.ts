import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getIsPro, getPremiumCredits, decrementPremiumCredits } from "@/lib/supabase/usage";
import { getTodayActivityCount, logActivity, FREE_DAILY_LIMIT } from "@/lib/supabase/activity";
import { TRANSFORMATION_TYPES, type TransformationType } from "@/lib/tone-presets";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

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
    const isPro = await getIsPro(admin, user.id, user.email);
    const premiumCredits = await getPremiumCredits(admin, user.id);
    if (!isPro && premiumCredits <= 0) {
      const todayCount = await getTodayActivityCount(admin, user.id);
      if (todayCount >= FREE_DAILY_LIMIT) {
        return NextResponse.json(
          { error: "Günlük kullanım hakkınız doldu. Yarın tekrar deneyebilir veya Premium'a geçebilirsiniz.", limitReached: true },
          { status: 402 }
        );
      }
    }

    const body = await req.json();
    const { text, transformationType } = body as { text: string; transformationType: TransformationType };

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Dönüştürülecek metin gerekli." },
        { status: 400 }
      );
    }

    const validTypes = Object.keys(TRANSFORMATION_TYPES);
    if (!transformationType || !validTypes.includes(transformationType)) {
      return NextResponse.json(
        { error: `Geçersiz dönüşüm türü. Geçerli: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Sunucuda OPENAI_API_KEY tanımlı değil." },
        { status: 500 }
      );
    }

    const transformation = TRANSFORMATION_TYPES[transformationType];

    let systemPrompt = "";
    switch (transformationType) {
      case "humanize":
        systemPrompt = `Sen bir içerik editörüsün. Görevin, verilen metni yapay zeka tarafından yazılmış izlenimi vermeyecek şekilde yeniden yazmak.

KURALLAR:
- Daha öznel ve kişisel ifadeler kullan
- Doğal, mükemmel olmayan cümle yapıları tercih et
- Küçük düzensizlikler ekle (ama anlaşılır kalsın)
- Tekrar eden kalıplardan kaçın
- İnsan deneyimi ve his içeren ifadeler ekle
- Samimi ama profesyonel bir dil kullan
- Aşırı mükemmel, robotik ifadelerden kaçın
- Bazen cümleleri "ve", "ama", "yani" gibi bağlaçlarla başlat
- Ara sıra kısaltmalar veya günlük dil kullan

Orijinal anlamı ve bilgiyi koru, sadece tonu ve ifade şeklini değiştir.
Sadece dönüştürülmüş metni yaz, ek açıklama ekleme.`;
        break;
      case "formal":
        systemPrompt = `Sen profesyonel bir editörsün. Görevin, verilen metni daha resmi ve kurumsal bir dile çevirmek.

KURALLAR:
- "Siz" hitabı kullan
- Teknik ve profesyonel terimler tercih et
- Kısa, net ve açık cümleler yaz
- Resmi yazışma formatına uygun
- Duygusal ifadelerden kaçın
- Nesnel ve tarafsız bir ton kullan

Orijinal anlamı koru, sadece tonu resmi yap.
Sadece dönüştürülmüş metni yaz, ek açıklama ekleme.`;
        break;
      case "simple":
        systemPrompt = `Sen bir sadeleştirme uzmanısın. Görevin, verilen metni daha sade ve anlaşılır hale getirmek.

KURALLAR:
- Gereksiz kelimeleri çıkar
- Uzun cümleleri kısalt
- Karmaşık ifadeleri basitleştir
- Teknik terimleri açıkla veya değiştir
- Net ve öz ol
- Herkesin anlayabileceği bir dil kullan

Orijinal anlamı koru, sadece sadeleştir.
Sadece dönüştürülmüş metni yaz, ek açıklama ekleme.`;
        break;
      case "professional":
        systemPrompt = `Sen bir iş dünyası iletişim uzmanısın. Görevin, verilen metni profesyonel iş diline çevirmek.

KURALLAR:
- Güven veren, yetkin bir ton kullan
- İş dünyası jargonunu yerinde kullan
- İkna edici ve etkileyici ifadeler tercih et
- Sonuç odaklı bir dil kullan
- Değer önerilerini vurgula
- Profesyonel ama samimi ol

Orijinal anlamı koru, sadece profesyonelleştir.
Sadece dönüştürülmüş metni yaz, ek açıklama ekleme.`;
        break;
      case "persuasive":
        systemPrompt = `Sen bir ikna ve pazarlama uzmanısın. Görevin, verilen metni daha ikna edici hale getirmek.

KURALLAR:
- Faydaları öne çıkar
- Duygusal bağ kur
- Aciliyet hissi yarat
- Sosyal kanıt unsurları ekle
- Harekete geçirici ifadeler kullan
- Güçlü fiiller tercih et
- Somut rakamlar ve örnekler ekle

Orijinal anlamı koru, sadece ikna edici yap.
Sadece dönüştürülmüş metni yaz, ek açıklama ekleme.`;
        break;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Bu metni ${transformation.label.toLowerCase()}:\n\n${text}` },
      ],
      max_tokens: 2000,
    });

    const result =
      completion.choices[0]?.message?.content?.trim() ||
      "Metin dönüştürülemedi. Lütfen tekrar dene.";

    await logActivity(admin, user.id, `transform_${transformationType}`);

    if (premiumCredits > 0) await decrementPremiumCredits(admin, user.id);

    return NextResponse.json({ text: result });
  } catch (err) {
    console.error("Humanize API error:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "AI yanıtı alınamadı. Lütfen tekrar deneyin.",
      },
      { status: 500 }
    );
  }
}
