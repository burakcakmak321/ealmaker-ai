export const TONE_PRESETS = {
  formal: {
    id: "formal",
    label: "Resmi",
    icon: "👔",
    promptHint: "Profesyonel, kurumsal, ciddi bir dil kullan. Teknik terimler tercih et. 'Siz' hitabı kullan.",
    example: "Bu ürün, üstün kalite malzemelerden üretilmiştir ve güvenilir performans sunar.",
  },
  friendly: {
    id: "friendly",
    label: "Samimi",
    icon: "😊",
    promptHint: "Sıcak, arkadaşça, günlük konuşma dili kullan. 'Sen' hitabı tercih et. Emoji kullanılabilir.",
    example: "Bu harika ürünü çok seveceksin! Tam senlik bir seçim.",
  },
  neutral: {
    id: "neutral",
    label: "Nötr",
    icon: "📋",
    promptHint: "Objektif, bilgi odaklı, ne çok resmi ne çok samimi. Dengeli ve net ifadeler kullan.",
    example: "Ürün özellikleri: yüksek kalite malzeme, dayanıklı yapı, pratik kullanım.",
  },
} as const;

export type TonePreset = keyof typeof TONE_PRESETS;

export const TRANSFORMATION_TYPES = {
  formal: {
    id: "formal",
    label: "Daha Resmi Yap",
    icon: "👔",
    description: "Metni profesyonel ve kurumsal dile çevir",
    promptHint: "Bu metni daha resmi, profesyonel ve kurumsal bir dile çevir. Teknik terimler kullan, 'Siz' hitabı tercih et.",
  },
  simple: {
    id: "simple",
    label: "Daha Sade Yap",
    icon: "📝",
    description: "Metni sadeleştir, gereksiz kelimeleri çıkar",
    promptHint: "Bu metni sadeleştir. Gereksiz kelimeleri çıkar, kısa ve öz cümleler kullan. Anlaşılır ve net olsun.",
  },
  professional: {
    id: "professional",
    label: "Profesyonelleştir",
    icon: "💼",
    description: "Metni iş dünyasına uygun hale getir",
    promptHint: "Bu metni profesyonel iş dünyası diline çevir. Güven veren, yetkin ve ikna edici bir ton kullan.",
  },
  humanize: {
    id: "humanize",
    label: "İnsanlaştır",
    icon: "🧑",
    description: "AI yazısını insan yazısı gibi yap",
    promptHint: "Bu metni yapay zeka tarafından yazılmış izlenimi vermeyecek şekilde yeniden yaz. Daha öznel ifadeler, doğal cümle yapıları ve küçük düzensizlikler ekle. İnsan deneyimi ve his içeren ifadeler kullan. Mükemmel olmayan ama samimi bir dil tercih et.",
  },
  persuasive: {
    id: "persuasive",
    label: "İkna Edici Yap",
    icon: "🎯",
    description: "Metni daha ikna edici hale getir",
    promptHint: "Bu metni daha ikna edici yap. Faydaları vurgula, duygusal bağ kur, harekete geçirici ifadeler ekle.",
  },
} as const;

export type TransformationType = keyof typeof TRANSFORMATION_TYPES;
