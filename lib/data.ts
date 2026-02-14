/** Ana sayfa ve şablon verileri */

export const STATS = [
  { label: "Oluşturulan metin", value: "15.600+", icon: "📄" },
  { label: "Aktif kullanıcı", value: "3.200+", icon: "👥" },
  { label: "AI destekli şablon", value: "80+", icon: "🤖" },
  { label: "Kullanıcı puanı", value: "4.9", icon: "⭐" },
];

export const TRUST_BADGES = [
  { label: "256-bit SSL güvenlik", icon: "🔒" },
  { label: "KVKK uyumlu", icon: "📜" },
  { label: "T.C. resmi format", icon: "🇹🇷" },
  { label: "Anında sonuç", icon: "⚡" },
  { label: "Veri saklanmaz", icon: "🛡️" },
];

export const FEATURES = [
  {
    title: "E-Ticaret & Sosyal Medya",
    description: "Trendyol, Hepsiburada, Amazon için SEO uyumlu ürün açıklamaları. Instagram, TikTok için viral hooklar ve senaryolar.",
    icon: "🛒",
    items: ["Platform algoritmasına özel başlıklar", "Müşteri SSS otomatik oluşturma", "Viral hook ve video senaryosu", "Taktik açıklamaları"],
  },
  {
    title: "Metin Dönüştürücü",
    description: "Metinlerinizi resmi, sade, profesyonel veya insan yazısı gibi dönüştürün. AI tespit araçlarından kaçının.",
    icon: "🔄",
    items: ["İnsanlaştırma (AI'dan kaçınma)", "Resmi/profesyonel dönüşüm", "Sadeleştirme", "İkna edici yapma"],
  },
  {
    title: "Resmi Yazı & Dilekçe",
    description: "Fatura itirazı, pazarlık mesajı, resmi dilekçe ve CV taslakları. T.C. standartlarına uygun format.",
    icon: "📄",
    items: ["Fatura/abonelik itirazı", "Pazarlık mesajları", "Belediye/kurum dilekçeleri", "Profesyonel CV taslağı"],
  },
  {
    title: "Saniyeler içinde hazır",
    description: "Karmaşık formlar yok. Birkaç alan doldur, yapay zeka profesyonel metni yazar. Zaman kaybı yok.",
    icon: "⚡",
    items: ["Bilgileri gir", "Dil tonunu seç", "Metni al ve kullan"],
  },
  {
    title: "%100 gizlilik",
    description: "Metinler anında üretilir; gereksiz kişisel veri saklanmaz. KVKK'ya uyumlu kullanım.",
    icon: "🔐",
    items: ["Sunucuda kalıcı saklama yok", "Şifreli bağlantı", "3. taraf paylaşımı yok"],
  },
];

export const TEMPLATE_CATEGORIES = [
  {
    title: "E-Ticaret Ürün Açıklaması",
    description: "Trendyol, Hepsiburada, Amazon ve diğer pazar yerleri için SEO uyumlu ürün başlığı ve açıklaması",
    icon: "🛒",
    count: "11 platform",
    usage: "Yeni",
    href: "/e-ticaret",
    tags: ["Trendyol", "Hepsiburada", "Amazon", "n11"],
    isNew: true,
  },
  {
    title: "Sosyal Medya İçerikleri",
    description: "Instagram, TikTok, YouTube için viral hooklar, video senaryoları ve etkili captionlar",
    icon: "📱",
    count: "5 platform",
    usage: "Yeni",
    href: "/sosyal-medya",
    tags: ["Instagram", "TikTok", "YouTube", "LinkedIn"],
    isNew: true,
  },
  {
    title: "Metin Dönüştürücü",
    description: "Metinleri resmi, sade, profesyonel veya insan yazısı gibi dönüştürün. AI tespit atlatma",
    icon: "🔄",
    count: "5 dönüşüm türü",
    usage: "Yeni",
    href: "/metin-donusturucu",
    tags: ["İnsanlaştır", "Resmi", "Profesyonel", "Sade"],
    isNew: true,
  },
  {
    title: "AI Destekli Fatura İtirazı",
    description: "İnternet, banka, operatör faturası; aidat ve abonelik itirazları için AI destekli taslak metin",
    icon: "📄",
    count: "15+ senaryo",
    usage: "8.2K kullanım",
    href: "/fatura",
    tags: ["İnternet faturası", "Banka aidatı", "Operatör iptali", "+12"],
  },
  {
    title: "AI Destekli Pazarlık Mesajı",
    description: "Sahibinden, Letgo, eBay — satıcıya profesyonel pazarlık mesajları hazırlayan AI destekli şablon",
    icon: "🤝",
    count: "10+ senaryo",
    usage: "5.1K kullanım",
    href: "/pazarlik",
    tags: ["Sahibinden", "Letgo", "eBay", "+7"],
  },
  {
    title: "AI Destekli Dilekçe Şablonu",
    description: "Belediye, kamu kurumları — yol, çöp, park, imar konularında AI destekli resmi yazı taslağı",
    icon: "🏛️",
    count: "12 şablon",
    usage: "4.8K kullanım",
    href: "/dilekce",
    tags: ["Yol onarım", "Çöp şikayeti", "Park talebi", "+9"],
  },
  {
    title: "AI Destekli CV Taslağı",
    description: "Yapay zeka ile profesyonel CV ve öz geçmiş taslağı oluşturucu",
    icon: "📋",
    count: "Tüm sektörler",
    usage: "2.4K kullanım",
    href: "/cv",
    tags: ["CV", "Öz geçmiş", "Kariyer", "İK"],
  },
];

export const POPULAR_TEMPLATES = [
  { title: "E-Ticaret ürün açıklaması", success: 94, usage: "Yeni", price: "Ücretsiz", href: "/e-ticaret", icon: "🛒" },
  { title: "Sosyal medya içeriği", success: 92, usage: "Yeni", price: "Ücretsiz", href: "/sosyal-medya", icon: "📱" },
  { title: "Metin insanlaştırma", success: 96, usage: "Yeni", price: "Ücretsiz", href: "/metin-donusturucu", icon: "🧑" },
  { title: "AI destekli fatura itirazı", success: 87, usage: "2.450+", price: "Ücretsiz", href: "/fatura", icon: "📶" },
  { title: "AI destekli pazarlık mesajı", success: 91, usage: "3.100+", price: "Ücretsiz", href: "/pazarlik", icon: "🤝" },
  { title: "AI destekli CV taslağı", success: 88, usage: "2.400+", price: "Ücretsiz", href: "/cv", icon: "📋" },
];

export const TESTIMONIALS = [
  { name: "Elif T.", city: "Antalya", type: "E-Ticaret", text: "Trendyol mağazam için ürün açıklamalarını bu site ile yazıyorum. SEO uyumlu başlıklar satışlarımı artırdı.", rating: 5, initials: "ET" },
  { name: "Can D.", city: "İstanbul", type: "Sosyal Medya", text: "TikTok videoları için hook ve senaryo önerileri muhteşem. Taktik açıklamaları sayesinde içerik stratejimi geliştirdim.", rating: 5, initials: "CD" },
  { name: "Ahmet K.", city: "İstanbul", type: "Fatura itirazı", text: "İnternet faturası yüksek gelmişti. AI destekli itiraz taslağını operatöre gönderdim, indirim yaptılar.", rating: 5, initials: "AK" },
  { name: "Sevgi Ö.", city: "Bursa", type: "CV taslağı", text: "CV'mi güncellemem gerekiyordu. AI destekli taslak çok iyi çıktı, Word'e yapıştırıp detayları ekledim.", rating: 5, initials: "SÖ" },
];

export const FAQ_HOME = [
  { q: "E-ticaret açıklamaları hangi platformları destekliyor?", a: "Trendyol, Hepsiburada, Amazon TR, n11, GittiGidiyor, Çiçeksepeti, Etsy, eBay, Sahibinden ve Letgo dahil 11 platform. Her platformun algoritmasına özel SEO uyumlu başlık ve açıklama üretiyoruz." },
  { q: "İnsanlaştırma özelliği ne işe yarar?", a: "AI tespit araçları (GPTZero, Originality.ai vb.) metninizi 'yapay zeka yazımı' olarak işaretliyorsa, insanlaştırma özelliği metni daha doğal ve insan yazısı gibi dönüştürür." },
  { q: "Sosyal medya içeriklerinde taktik açıklamaları nedir?", a: "Her hook, CTA ve senaryo önerisinin yanında neden işe yaradığını açıklayan kısa bilgiler sunuyoruz. Bu sayede sadece içerik değil, strateji de öğrenirsiniz." },
  { q: "Metinler yasal olarak geçerli mi?", a: "Üretilen metinler BİLGİLENDİRME AMAÇLIDIR. Hukuki tavsiye değildir. Önemli işlemlerde yetkili uzmana danışın." },
  { q: "Ücretsiz plan yeterli mi?", a: "Günlük 3 kullanım ücretsiz. Denemek için yeterli. Sınırsız kullanım için Premium paketlerimizi inceleyin." },
];
