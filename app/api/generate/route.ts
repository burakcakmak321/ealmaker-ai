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

type ModuleType = "fatura" | "pazarlik" | "dilekce" | "cv" | "eticaret" | "sosyalmedya" | "blogseo";

function buildSystemPrompt(type: ModuleType, payload: Record<string, unknown>): string {
  switch (type) {
    case "fatura": {
      const kurum = (payload.kurum as string) || "kurum";
      const konu = (payload.konu as string) || "fatura itirazı";
      const detay = (payload.detay as string) || "";
      return `Sen Türkiye'de hukuki ve resmi yazışmalarda uzman bir asistansın. Kullanıcı fatura veya abonelik itirazı yazacak.

KURUM: ${kurum}
KONU: ${konu}
DETAY: ${detay || "Belirtilmedi"}

KURALLAR:
1. 6502 sayılı Tüketicinin Korunması Hakkında Kanun'a uygun yaz
2. İtirazı net, saygılı ve ikna edici ifade et
3. Müşteri numarası, fatura tutarı gibi bilgiler varsa kullan
4. Talep (indirim, iade, iptal vb.) açıkça belirtilsin
5. Hitap ile başla, saygıyla bitir
6. E-posta veya dilekçe formatında, kopyala-yapıştır hazır olsun

Sadece metni yaz, ek açıklama ekleme.`;
    }
    case "pazarlik": {
      const platform = (payload.platform as string) || "ikinci el platform";
      const urun = (payload.urun as string) || "ürün";
      const fiyat = (payload.fiyat as string) || "belirtilmemiş";
      const hedefFiyat = (payload.hedefFiyat as string) || "";
      return `Sen ikinci el ve e-ticaret pazarlığında uzman bir asistansın. Kullanıcı satıcıya mesaj atacak.

PLATFORM: ${platform}
ÜRÜN: ${urun}
İLAN FİYATI: ${fiyat}
HEDEF FİYAT: ${hedefFiyat || "Belirtilmedi"}

KURALLAR:
1. 3 kısa mesaj hazırla, her biri 1-2 cümle
2. Mesaj 1: Selam + ürüne ilgi göster
3. Mesaj 2: Nazikçe fiyat teklifi veya soru sor
4. Mesaj 3: Son teklif veya teşekkür
5. Samimi, saygılı, pazarlık niyetini belli eden dil
6. Emoji kullanma, profesyonel ama sıcak kal

"1." "2." "3." ile numaralandır. Sadece mesajları yaz.`;
    }
    case "dilekce": {
      const baslik = (payload.baslik as string) || (payload.kurum as string) || "Dilekçe";
      const konu = (payload.konu as string) || "";
      const detay = (payload.detay as string) || "";
      return `Sen Türkiye'de resmi dilekçe yazımında uzman bir asistansın. 657 sayılı DMK ve dilekçe usulüne hakimsin.

KURUM/BAŞLIK: ${baslik}
KONU: ${konu}
DETAY: ${detay || "Belirtilmedi"}

FORMAT (sırayla):
1. Hitap (Sayın ...)
2. İlgi (Konu: ...)
3. Giriş paragrafı
4. Talebin açıklandığı metin
5. "Saygılarımla arz ederim." ile bitir
6. İmza ve tarih için boşluk bırak

KURALLAR: Resmi dil, net ifade, gereksiz tekrar yok. Sadece dilekçe metnini yaz.`;
    }
    case "cv": {
      const adSoyad = (payload.adSoyad as string) || "Kullanıcı";
      const hedefPozisyon = (payload.hedefPozisyon as string) || "Belirtilmedi";
      const ozet = (payload.ozet as string) || "";
      const deneyim = (payload.deneyim as string) || "";
      const egitim = (payload.egitim as string) || "";
      const beceriler = (payload.beceriler as string) || "";
      const dil = (payload.dil as string) || "";
      return `Sen ATS (başvuru takip sistemi) uyumlu CV yazımında uzman bir kariyer danışmanısın.

AD SOYAD: ${adSoyad}
HEDEF POZİSYON: ${hedefPozisyon}
PROFESYONEL ÖZET: ${ozet}
İŞ DENEYİMİ: ${deneyim}
EĞİTİM: ${egitim}
BECERİLER: ${beceriler}
DİLLER: ${dil}

KURALLAR:
1. Başlık (Ad Soyad) ile başla
2. 3-4 cümlelik güçlü özet (hedef pozisyona uygun)
3. Deneyim: Firma, tarih, başarı odaklı maddeler (fiil + sonuç)
4. Eğitim: Kurum, bölüm, yıl
5. Beceriler: Virgülle ayır, ilgili alanları vurgula
6. Diller: Seviye belirt
7. Düz metin, madde işaretleri (- veya •), ATS dostu
8. Türkçe, profesyonel ton

Sadece CV içeriğini yaz.`;
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

      return `Sen ${platform.name} ve e-ticaret ürün listeleme uzmanısın. Satış dönüşümü yüksek içerik üretiyorsun.

⚠️ KRİTİK: SADECE verilen ürün bilgilerini kullan. UYDURMA yapma.

PLATFORM: ${platform.name}
- Başlık: Max ${platform.maxTitleLength} karakter, format: ${platform.titleFormat}
- Açıklama: Max ${platform.descMaxLength} karakter

ÜRÜN BİLGİLERİ:
${urunBilgisi || "Belirtilmedi"}

TON: ${tone.promptHint}

GÖREV:
1. BAŞLIK: Anahtar kelimeleri içeren, SEO uyumlu, karakter sınırına uygun
2. AÇIKLAMA: 
   - Üstün özelliklerle başla
   - Madde işaretleri (•) ile liste
   - Teknik özellikler, malzeme, kullanım alanı
   - Güven verici, ikna edici dil
${includeSSS ? `
3. SIK SORULAN SORULAR: Bu ürüne özel 4-5 alıcı sorusu + cevap. Her soru "❓" ile, cevap "✅" ile başlasın.` : ""}

FORMAT:
📌 BAŞLIK:
[başlık]

📝 AÇIKLAMA:
[açıklama]
${includeSSS ? `
❓ SIK SORULAN SORULAR:
[sorular]` : ""}

Sadece içeriği yaz.`;
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

      return `Sen ${platform.name} için viral içerik üreten profesyonel sosyal medya stratejistisin.

📌 KONU: "${konu}"
${icerikTuru ? `İÇERİK TÜRÜ: ${icerikTuru}` : ""}
${hedefKitle ? `HEDEF: ${hedefKitle}` : ""}
${amac ? `AMAÇ: ${amac}` : ""}

TON: ${tone.promptHint}

KURALLAR:
1. SADECE "${konu}" hakkında yaz - başka konuya geçme
2. Genel kalıplar YASAK (örn: "Bunu bilmiyorsan kaybediyorsun")
3. Her öneri konuya ÖZEL, orijinal olsun
4. Konu türüne göre ton: Eğitim→bilgilendirici, Ürün→satış odaklı, Eğlence→viral
${includeTactics ? `5. Her önerinin altına [💡 Taktik: neden işe yarar] ekle` : ""}

GÖREV:
${contentInstructions}

FORMAT: Emoji başlıklar, numaralı listeler, kopyala-yapıştır hazır içerik.`;
    }
    case "blogseo": {
      const toolType = (payload.tool as string) || "outline";
      const toneKey = (payload.tone as string) || "neutral";
      const tone = TONE_PRESETS[toneKey as keyof typeof TONE_PRESETS] || TONE_PRESETS.neutral;
      const anahtarKelime = (payload.anahtarKelime as string) || "";
      const konu = (payload.konu as string) || "";
      const kategori = (payload.kategori as string) || "";
      const hedefKitle = (payload.hedefKitle as string) || "";
      const kelimeSayisi = (payload.kelimeSayisi as string) || "1500";

      if (toolType === "outline") {
        return `Sen SEO uzmanı ve profesyonel blog yazarısın.

⚠️ KRİTİK: Tüm içerik SADECE "${anahtarKelime}" anahtar kelimesi etrafında olmalı.

📌 ANAHTAR KELİME: "${anahtarKelime}"
${konu ? `📎 KONU DETAYI: ${konu}` : ""}
${kategori ? `📂 KATEGORİ: ${kategori}` : ""}
${hedefKitle ? `👥 HEDEF KİTLE: ${hedefKitle}` : ""}
📏 HEDEF: ~${kelimeSayisi} kelime

🎨 DİL TONU: ${tone.promptHint}

GÖREVİN: "${anahtarKelime}" için detaylı blog ana hatları (outline) oluştur:

1. BAŞLIK ÖNERİLERİ (3 adet SEO uyumlu, anahtar kelime içeren)
2. META AÇIKLAMA (155 karakter, anahtar kelime geçmeli)
3. GİRİŞ BÖLÜMÜ taslağı
4. ANA BAŞLIKLAR (H2) ve alt başlıklar (H3) - en az 5 ana bölüm
5. Her bölüm için 2-3 cümlelik içerik özeti
6. SONUÇ bölümü
7. DAHİLİ LİNK ÖNERİLERİ (ilişkili konular)
8. CTA (harekete geçirici kapanış)

⚠️ ÖNEMLİ:
- Anahtar kelimeyi doğal şekilde başlıklara ve alt başlıklara yerleştir
- LSI (ilişkili) anahtar kelimeleri kullan
- Her bölüm konuyla doğrudan ilgili olmalı
- Kullanıcının verdiği bilgilerden SAPMA`;
      }

      if (toolType === "meta") {
        return `Sen SEO uzmanısın. "${anahtarKelime}" için meta açıklama yaz.

⚠️ SADECE "${anahtarKelime}" hakkında yaz.
${konu ? `Ek bilgi: ${konu}` : ""}

GÖREVİN:
1. 5 farklı META DESCRIPTION yaz (her biri 150-160 karakter)
2. Her birinde "${anahtarKelime}" anahtar kelimesi geçmeli
3. Tıklama oranını artıracak ikna edici dil kullan
4. Rakamlar, soru veya güçlü fiiller kullan
5. Her önerinin altına karakter sayısını yaz

FORMAT:
1. [Meta açıklama] (X karakter)
2. [Meta açıklama] (X karakter)
...`;
      }

      if (toolType === "title") {
        return `Sen SEO uzmanı ve başlık yazarısın. "${anahtarKelime}" için blog başlıkları öner.

⚠️ SADECE "${anahtarKelime}" hakkında başlıklar yaz.
${konu ? `Ek bilgi: ${konu}` : ""}

GÖREVİN:
10 farklı blog başlığı öner. Her başlık:
- "${anahtarKelime}" anahtar kelimesini içermeli
- Tıklanma oranı yüksek olmalı
- Farklı formatlarda: liste, soru, nasıl yapılır, rehber, karşılaştırma
- Her başlığın altına [Neden etkili] açıklaması yaz

FORMAT:
1. [Başlık]
   → [Neden etkili: ...]
...`;
      }

      return `Sen SEO ve anahtar kelime uzmanısın. "${anahtarKelime}" için anahtar kelime analizi yap.

⚠️ SADECE "${anahtarKelime}" ile ilgili kelimeler öner.
${konu ? `Ek bilgi: ${konu}` : ""}

GÖREVİN:
1. ANA ANAHTAR KELİME analizi
2. UZUN KUYRUK (long-tail) anahtar kelimeler (10 adet)
3. LSI (ilişkili) anahtar kelimeler (10 adet)
4. SORU FORMATINDA anahtar kelimeler (5 adet - "People Also Ask" tarzı)
5. İÇERİK BOŞLUKLARI (rakiplerin kaçırdığı konular)
6. ÖNERİLEN İÇERİK STRATEJİSİ

Her önerinin yanına tahmini arama hacmi (düşük/orta/yüksek) ve rekabet düzeyini belirt.`;
    }
    default:
      return "Genel metin üret.";
  }
}

function buildGenerationTitle(type: ModuleType, payload: Record<string, unknown>): string {
  switch (type) {
    case "fatura": return (payload.konu as string) || "Fatura itirazı";
    case "pazarlik": return (payload.urun as string) || "Pazarlık mesajı";
    case "dilekce": return (payload.konu as string) || (payload.kurum as string) || "Dilekçe";
    case "cv": return (payload.hedefPozisyon as string) || "CV taslağı";
    case "eticaret": return (payload.urunBilgisi as string) || (payload.marka as string) || "Ürün açıklaması";
    case "sosyalmedya": return (payload.konu as string) || "Sosyal medya içeriği";
    case "blogseo": return (payload.anahtarKelime as string) || "Blog/SEO";
    default: return type;
  }
}

function buildInputPreview(type: ModuleType, payload: Record<string, unknown>): string {
  const parts: string[] = [];
  if (type === "fatura") parts.push(String(payload.kurum || ""), String(payload.konu || ""), String(payload.detay || "").slice(0, 100));
  if (type === "pazarlik") parts.push(String(payload.urun || ""), String(payload.fiyat || ""), String(payload.hedefFiyat || ""));
  if (type === "dilekce") parts.push(String(payload.kurum || payload.baslik || ""), String(payload.konu || ""), String(payload.detay || "").slice(0, 100));
  if (type === "cv") parts.push(String(payload.adSoyad || ""), String(payload.hedefPozisyon || ""), String(payload.ozet || "").slice(0, 80));
  if (type === "eticaret") parts.push(String(payload.urunBilgisi || payload.marka || ""), String(payload.platform || ""));
  if (type === "sosyalmedya") parts.push(String(payload.konu || "").slice(0, 100));
  if (type === "blogseo") parts.push(String(payload.anahtarKelime || ""), String(payload.tool || ""));
  return parts.filter(Boolean).join(" · ").slice(0, 200);
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
    case "blogseo":
      return "Blog/SEO içeriğini oluştur.";
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

    const validTypes = ["fatura", "pazarlik", "dilekce", "cv", "eticaret", "sosyalmedya", "blogseo"];
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
      max_tokens: type === "eticaret" || type === "sosyalmedya" || type === "blogseo" ? 2500 : 1500,
    });

    const text =
      completion.choices[0]?.message?.content?.trim() ||
      "Metin oluşturulamadı. Lütfen tekrar dene.";

    await logActivity(admin, user.id, type);

    if (premiumCredits > 0) await decrementPremiumCredits(admin, user.id);

    // Kullanıcı geçmişine kaydet (user_generations tablosu varsa)
    try {
      const title = buildGenerationTitle(type, payload);
      const inputPreview = buildInputPreview(type, payload);
      await admin.from("user_generations").insert({
        user_id: user.id,
        module: type,
        title,
        input_preview: inputPreview,
        output_text: text,
        payload: body,
      });
    } catch {
      // Tablo yoksa veya hata olursa sessizce geç
    }

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
