import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getIsPro, getPremiumCredits, decrementPremiumCredits } from "@/lib/supabase/usage";
import { getTodayActivityCount, logActivity, FREE_DAILY_LIMIT } from "@/lib/supabase/activity";
import { ETICARET_PLATFORMS } from "@/lib/eticaret-platforms";
import { TONE_PRESETS } from "@/lib/tone-presets";
import { SOCIAL_PLATFORMS, CONTENT_TYPES } from "@/lib/social-media-config";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

type ModuleType = "fatura" | "pazarlik" | "dilekce" | "cv" | "eticaret" | "sosyalmedya";

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
    case "eticaret": {
      const platformId = (payload.platform as string) || "genel";
      const platform = ETICARET_PLATFORMS.find((p) => p.id === platformId) || ETICARET_PLATFORMS[ETICARET_PLATFORMS.length - 1];
      const toneKey = (payload.tone as string) || "neutral";
      const tone = TONE_PRESETS[toneKey as keyof typeof TONE_PRESETS] || TONE_PRESETS.neutral;
      const includeSSS = payload.includeSSS !== false;
      const inputMode = payload.inputMode as string;
      
      let urunBilgisi = "";
      if (inputMode === "simple") {
        urunBilgisi = (payload.urunBilgisi as string) || "";
      } else {
        const marka = (payload.marka as string) || "";
        const model = (payload.model as string) || "";
        const ozellik = (payload.ozellik as string) || "";
        const renk = (payload.renk as string) || "";
        const boyut = (payload.boyut as string) || "";
        const fiyat = (payload.fiyat as string) || "";
        urunBilgisi = [
          marka && `Marka: ${marka}`,
          model && `Model: ${model}`,
          ozellik && `Özellikler: ${ozellik}`,
          renk && `Renk: ${renk}`,
          boyut && `Boyut/Beden: ${boyut}`,
          fiyat && `Fiyat: ${fiyat}`,
        ].filter(Boolean).join("\n");
      }

      return `Sen e-ticaret ve pazar yeri optimizasyonunda uzman bir içerik yazarısın. ${platform.name} için ürün başlığı ve açıklaması yazacaksın.

PLATFORM BİLGİLERİ:
- Platform: ${platform.name}
- Başlık Formatı: ${platform.titleFormat}
- Max Başlık: ${platform.maxTitleLength} karakter
- Max Açıklama: ${platform.descMaxLength} karakter

ÜRÜN BİLGİLERİ:
${urunBilgisi}

DİL TONU:
${tone.promptHint}

GÖREVİN:
1. SEO uyumlu, platform algoritmasına özel bir BAŞLIK yaz (max ${platform.maxTitleLength} karakter)
2. Detaylı, ikna edici bir AÇIKLAMA yaz
3. Anahtar kelimeleri doğal şekilde yerleştir
4. Madde işaretleri ile özellikleri listele
${includeSSS ? `
5. MÜŞTERİ SSS BÖLÜMÜ: Potansiyel alıcıların sorabileceği 5 soru ve yanıtlarını yaz. Her soru "❓" ile başlasın, cevap "✅" ile başlasın.` : ""}

FORMAT:
📌 BAŞLIK:
[başlık buraya]

📝 AÇIKLAMA:
[açıklama buraya]
${includeSSS ? `
❓ SIK SORULAN SORULAR:
[sorular ve cevaplar buraya]` : ""}

Sadece içeriği yaz, ek açıklama ekleme.`;
    }
    case "sosyalmedya": {
      const platformKey = (payload.platform as string) || "instagram";
      const platform = SOCIAL_PLATFORMS[platformKey as keyof typeof SOCIAL_PLATFORMS] || SOCIAL_PLATFORMS.instagram;
      const contentType = (payload.contentType as string) || "all";
      const toneKey = (payload.tone as string) || "friendly";
      const tone = TONE_PRESETS[toneKey as keyof typeof TONE_PRESETS] || TONE_PRESETS.friendly;
      const includeTactics = payload.includeTactics !== false;
      const konu = (payload.konu as string) || "";
      const hedefKitle = (payload.hedefKitle as string) || "";
      const amac = (payload.amac as string) || "";
      const icerikTuru = (payload.icerikTuru as string) || "";
      const hashtags = (payload.hashtags as boolean) !== false;

      let contentInstructions = "";
      if (contentType === "all" || contentType === "hook") {
        contentInstructions += `
🪝 VİRAL HOOK'LAR (İlk 3 saniye için):
- "${konu}" konusuyla DOĞRUDAN İLGİLİ 10 farklı hook cümlesi yaz
- Her hook bu konuya özel olmalı, genel kalıp kullanma
- Teknikler: Merak uyandırma, şaşırtıcı bilgi, soru sorma, liste vaat etme, hikaye başlatma
- Her hook izleyiciyi durduracak güçte olmalı
${includeTactics ? "- Her hook'un altına [💡 Taktik: Bu neden işe yarar?] açıklaması ekle" : ""}
`;
      }
      if (contentType === "all" || contentType === "scenario") {
        contentInstructions += `
🎬 VİDEO SENARYOSU (Reels/TikTok/Shorts - 30sn):
"${konu}" konusu için detaylı senaryo yaz:
- 0-3sn (HOOK): Dikkat çekici açılış - konuyla direkt ilgili şaşırtıcı bir bilgi veya soru
- 3-10sn (PROBLEM/MERAK): İzleyicinin ilgisini çekecek detay veya sorun
- 10-25sn (DEĞER): Ana içerik, bilgi veya hikaye
- 25-30sn (CTA): Harekete geçirici kapanış
${includeTactics ? "- Her bölümün altına [💡 Taktik] açıklaması ekle" : ""}
`;
      }
      if (contentType === "all" || contentType === "caption") {
        contentInstructions += `
✍️ CAPTION / ALTYAZI:
"${konu}" için ${platform.name} caption'ı yaz:
- Max ${platform.maxCaptionLength} karakter
- İlk satır çok dikkat çekici olsun (hook görevi görsün)
- Konuyla ilgili emojiler yerleştir
- Paragraflar halinde oku naklı formatla
${hashtags ? `- ${platform.hashtagLimit} adet konuyla alakalı hashtag öner` : ""}
${includeTactics ? "- [💡 Taktik] açıklaması ekle" : ""}
`;
      }
      if (contentType === "all" || contentType === "cta") {
        contentInstructions += `
🎯 CTA (Harekete Geçirici Mesajlar):
"${konu}" için 5 farklı CTA yaz:
- Takip ettirici CTA
- Kaydet dedirtici CTA
- Yorum yaptırıcı CTA
- Paylaştırıcı CTA
- Amaca özel CTA ${amac ? `(${amac})` : ""}
${includeTactics ? "- Her CTA'nın altına [💡 Taktik] açıklaması ekle" : ""}
`;
      }

      return `Sen ${platform.name} için içerik üreten profesyonel bir sosyal medya stratejistisin.

⚠️ KRİTİK KURAL: Tüm içerikler YALNIZCA ve SADECE aşağıdaki konu hakkında olmalı. Başka konuya ASLA geçme!

📌 KONU: "${konu}"
${icerikTuru ? `📎 İÇERİK TÜRÜ: ${icerikTuru}` : ""}
${hedefKitle ? `👥 HEDEF KİTLE: ${hedefKitle}` : ""}
${amac ? `🎯 AMAÇ: ${amac}` : ""}

🎨 DİL TONU: ${tone.promptHint}

📋 GÖREVİN:
${contentInstructions}

⚠️ ÖNEMLİ UYARILAR:
1. SADECE "${konu}" hakkında yaz - başka konuya geçme, alakasız örnek verme
2. Genel kalıp cümleler kullanma (örn: "Bunu bilmiyorsan X TL kaybediyorsun" gibi)
3. Her öneri bu konuya ÖZEL ve ORİJİNAL olmalı
4. Konu tarih/eğitim ise bilgilendirici, konu ürün ise satış odaklı, konu eğlence ise viral odaklı yaz
5. İzleyicinin "${konu}" hakkında merak edeceği şeylere odaklan
${includeTactics ? `6. Her önerinin altına [💡 Taktik: ...] formatında kısa açıklama ekle - bu önerinin neden işe yaradığını, hangi psikolojik/pazarlama prensibini kullandığını açıkla` : ""}

📝 FORMAT:
- Her bölümü emoji başlığıyla ayır
- Numaralandırılmış listeler kullan
- Net, kopyala-yapıştır hazır içerikler üret`;
    }
    default:
      return "Genel metin üret.";
  }
}

function getUserMessage(type: ModuleType): string {
  switch (type) {
    case "fatura":
      return "Fatura/itiraz dilekçesini yaz.";
    case "pazarlik":
      return "Pazarlık mesajlarını yaz.";
    case "cv":
      return "CV taslağını oluştur.";
    case "dilekce":
      return "Dilekçe metnini yaz.";
    case "eticaret":
      return "E-ticaret ürün başlığı ve açıklamasını oluştur.";
    case "sosyalmedya":
      return "Sosyal medya içeriğini oluştur.";
    default:
      return "Metni oluştur.";
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
    const { type, ...payload } = body as { type: ModuleType; [k: string]: unknown };

    const validTypes = ["fatura", "pazarlik", "dilekce", "cv", "eticaret", "sosyalmedya"];
    if (!type || !validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Geçersiz modül. type: ${validTypes.join(" | ")}` },
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
        { role: "user", content: getUserMessage(type) },
      ],
      max_tokens: type === "eticaret" || type === "sosyalmedya" ? 2500 : 1500,
    });

    const text =
      completion.choices[0]?.message?.content?.trim() ||
      "Metin oluşturulamadı. Lütfen tekrar dene.";

    await logActivity(admin, user.id, type);

    if (premiumCredits > 0) await decrementPremiumCredits(admin, user.id);

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
