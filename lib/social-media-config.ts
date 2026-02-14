export const SOCIAL_PLATFORMS = {
  instagram: {
    id: "instagram",
    name: "Instagram",
    icon: "📸",
    features: ["Reels", "Story", "Post", "Caption"],
    maxCaptionLength: 2200,
    hashtagLimit: 30,
    tips: ["Emoji kullanımı etkileşimi artırır", "İlk satır çok önemli", "CTA ekleyin"],
  },
  tiktok: {
    id: "tiktok",
    name: "TikTok",
    icon: "🎵",
    features: ["Video Senaryo", "Hook", "Trend"],
    maxCaptionLength: 300,
    hashtagLimit: 5,
    tips: ["İlk 3 saniye kritik", "Trend sesleri kullanın", "Döngü yapın"],
  },
  youtube: {
    id: "youtube",
    name: "YouTube",
    icon: "▶️",
    features: ["Shorts", "Video Açıklaması", "Başlık"],
    maxCaptionLength: 5000,
    hashtagLimit: 15,
    tips: ["SEO için anahtar kelimeler", "Thumbnail önemi", "Açıklamada linkler"],
  },
  twitter: {
    id: "twitter",
    name: "X (Twitter)",
    icon: "🐦",
    features: ["Tweet", "Thread", "Hook"],
    maxCaptionLength: 280,
    hashtagLimit: 3,
    tips: ["Kısa ve vurucu", "Tartışma başlatın", "Görsel ekleyin"],
  },
  linkedin: {
    id: "linkedin",
    name: "LinkedIn",
    icon: "💼",
    features: ["Post", "Makale", "Hook"],
    maxCaptionLength: 3000,
    hashtagLimit: 5,
    tips: ["Profesyonel ton", "Deneyim paylaşın", "Soru sorun"],
  },
} as const;

export type SocialPlatform = keyof typeof SOCIAL_PLATFORMS;

export const CONTENT_TYPES = {
  hook: {
    id: "hook",
    label: "Viral Hook / Kanca",
    icon: "🪝",
    description: "İlk 3 saniyede durduracak çarpıcı giriş cümleleri",
    count: 10,
  },
  scenario: {
    id: "scenario",
    label: "Video Senaryosu",
    icon: "🎬",
    description: "Saniye saniye video planı (Reels/TikTok/Shorts)",
    sections: ["0-3sn: Hook", "3-10sn: Problem", "10-25sn: Çözüm", "25-30sn: CTA"],
  },
  caption: {
    id: "caption",
    label: "Caption / Altyazı",
    icon: "✍️",
    description: "Platform uyumlu metin + otomatik emoji",
  },
  cta: {
    id: "cta",
    label: "Harekete Geçirici (CTA)",
    icon: "🎯",
    description: "Etkili kapanış cümleleri",
    examples: ["Takip et", "Kaydet", "Yoruma yaz", "Link bio'da", "Arkadaşını etiketle"],
  },
} as const;

export type ContentType = keyof typeof CONTENT_TYPES;

export const HOOK_TEMPLATES = [
  { category: "Merak", template: "Bunu bilmiyorsan {X}₺ kaybediyorsun", tactic: "Kayıp korkusu (FOMO) + somut rakam dikkat çeker" },
  { category: "Şok", template: "Herkes yanlış yapıyor, doğrusu bu", tactic: "Kontrast ve sürpriz beyni uyarır" },
  { category: "Soru", template: "Sen de bu hatayı yapıyor musun?", tactic: "Kişiselleştirme ve merak uyandırır" },
  { category: "Liste", template: "3 şey bilmen lazım", tactic: "Sayılar somutlaştırır, kolay tüketim vaat eder" },
  { category: "Hikaye", template: "Dün başıma inanılmaz bir şey geldi", tactic: "Hikaye anlatımı insanları çeker" },
  { category: "Uyarı", template: "Bunu sakın yapma!", tactic: "Negatif çerçeveleme dikkat çeker" },
  { category: "Vaat", template: "30 saniyede {X} öğreneceksin", tactic: "Net fayda + kısa süre vaadi" },
  { category: "Tartışma", template: "Bu konuda yanılıyorsunuz", tactic: "Polarizan içerik etkileşim getirir" },
] as const;

export const CTA_TEMPLATES = [
  { type: "Takip", text: "Daha fazlası için takip et 👆", context: "Hesap büyütme" },
  { type: "Kaydet", text: "Kaydet, lazım olacak 📌", context: "İçerik değeri vurgulama" },
  { type: "Yorum", text: "Sen ne düşünüyorsun? Yoruma yaz 💬", context: "Etkileşim artırma" },
  { type: "Paylaş", text: "Bunu bilmesi gereken birini etiketle", context: "Organik yayılım" },
  { type: "Link", text: "Detaylar bio'daki linkte 🔗", context: "Trafik yönlendirme" },
  { type: "DM", text: "İstersen DM at, yardımcı olayım", context: "Kişisel bağlantı" },
  { type: "Satış", text: "Stoklar sınırlı, kaçırma!", context: "Aciliyet yaratma" },
  { type: "Topluluk", text: "Ailemize katıl 🤝", context: "Topluluk hissi" },
] as const;
