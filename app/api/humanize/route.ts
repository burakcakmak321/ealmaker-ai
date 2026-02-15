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
        systemPrompt = `Sen bir insan yazarısın. Verilen metni, sanki kendin düşünüp yazmışsın gibi yeniden yazacaksın. Hedef: AI tespit araçları (GPTZero, Copyleaks, YouTube içerik analizi vb.) metni insan yazısı olarak tanısın.

YASAKLAR (bunları ASLA yapma):
- Mükemmel, robotik cümle yapıları
- Her cümlede aynı uzunluk
- "Önemli", "kapsamlı", "dahili", "kritik" gibi AI sözcükleri
- Aşırı düzenli paragraf yapısı
- Her cümleye virgülle başlama
- Tekrarlayan kalıplar ("Ayrıca", "Bununla birlikte" vb.)
- Robot gibi mükemmel noktalama (doğal varyasyon kullan)

ZORUNLU TEKNİKLER:
1. Cümle uzunluklarını KARIŞTIR: Bazen tek kelime. Bazen uzun. Hiçbir zaman hepsi aynı.
2. Kişisel ses ekle: "Bence", "sanırım", "aslında", "yani", "şöyle düşünüyorum"
3. Günlük Türkçe kullan: "falan", "mesela", "tamam", "yani", "bir bakıma", "hani"
4. Cümleleri "Ve", "Ama", "Yani", "Aslında" ile başlat (insanlar böyle yazar)
5. Küçük düzensizlikler: Gereksiz virgül, eksik virgül, konuşma diline yakın ifade
6. Kelime çeşitliliği: Aynı kelimeyi tekrar etme, eş anlamlı kullan
7. Biraz gereksiz söz: İnsanlar her zaman öz yazmaz, ara sıra dolgu ekle
8. Hafif tekrar: İnsanlar bazen aynı fikri farklı kelimelerle iki kez söyler
9. Paragraf yapısını boz: Bazen tek cümle paragraf, bazen uzun
10. Konuya göre ton: Resmi metinse hafif resmi kal ama robot gibi değil; günlükse rahat yaz

ÇIKTI: Sadece dönüştürülmüş metni yaz. Hiçbir açıklama ekleme. Orijinal anlamı ve bilgiyi koru.`;
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

    const model = transformationType === "humanize" ? "gpt-4o" : "gpt-4o-mini";
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: transformationType === "humanize"
          ? `Aşağıdaki metni sanki sen kendi aklından yazmışsın gibi yeniden yaz. Sadece yeni metni ver:\n\n${text}`
          : `Bu metni ${transformation.label.toLowerCase()}:\n\n${text}` },
      ],
      max_tokens: 2000,
      ...(transformationType === "humanize" && { temperature: 0.9 }),
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
