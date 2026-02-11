/** Ana sayfa ve şablon verileri */

export const STATS = [
  { label: "Oluşturulan metin", value: "12.400+", icon: "📄" },
  { label: "Aktif kullanıcı", value: "2.800+", icon: "👥" },
  { label: "AI destekli şablon", value: "50+", icon: "🤖" },
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
    title: "AI destekli metin üretimi",
    description: "Yapay zeka ile fatura itirazı, pazarlık mesajı, resmi yazı taslağı ve CV. Her modülde hazır senaryolar; kurum ve konuya göre taslak üretilir. Bilgilendirme amaçlıdır, hukuki tavsiye değildir.",
    icon: "🤖",
    items: ["AI destekli fatura itirazı taslağı", "AI destekli pazarlık mesajı", "AI destekli dilekçe taslağı", "AI destekli CV taslağı"],
  },
  {
    title: "Saniyeler içinde hazır",
    description: "Karmaşık formlar yok. Birkaç alan doldur, yapay zeka profesyonel metni yazar. Zaman kaybı yok.",
    icon: "⚡",
    items: ["Kurum / konu gir", "İsteğe detay ekle", "Metni al, kopyala veya yazdır"],
  },
  {
    title: "T.C. standartlarında",
    description: "Resmi yazı taslakları ve CV formatları Türkiye standartlarına uyumlu. Kurumun dilinde, profesyonel ifadelerle.",
    icon: "🇹🇷",
    items: ["Resmi hitap ve sonuç", "657 DMK uyumlu format", "İkna edici pazarlık metni"],
  },
  {
    title: "PDF & yazdır",
    description: "Metni kopyala, Word’e yapıştır veya tarayıcıdan PDF olarak kaydet. Yazdır, imzala, gönder.",
    icon: "📥",
    items: ["Tek tıkla kopyala", "Yazdır / PDF kaydet", "Dilekçe için imza alanı"],
  },
  {
    title: "%100 gizlilik",
    description: "Metinler anında üretilir; gereksiz kişisel veri saklanmaz. KVKK’ya uyumlu kullanım.",
    icon: "🔐",
    items: ["Sunucuda kalıcı saklama yok", "Şifreli bağlantı", "3. taraf paylaşımı yok"],
  },
];

export const TEMPLATE_CATEGORIES = [
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
    title: "AI Destekli Tüketici Yazısı",
    description: "Ürün iadesi, cayma hakkı, garanti, ayıplı mal şikayeti için AI destekli taslak",
    icon: "🛒",
    count: "8 şablon",
    usage: "3.2K kullanım",
    href: "/dilekce",
    tags: ["İade", "Şikayet", "Cayma hakkı", "+5"],
  },
  {
    title: "AI Destekli Kira Yazısı",
    description: "Kira artışı itirazı, tahliye, depozito, sözleşme feshi için AI destekli taslak metin",
    icon: "🏠",
    count: "6 şablon",
    usage: "2.1K kullanım",
    href: "/dilekce",
    tags: ["Kira itirazı", "Depozito", "Fesih", "+3"],
  },
  {
    title: "AI Destekli CV Taslağı",
    description: "Yapay zeka ile profesyonel CV ve öz geçmiş taslağı oluşturucu",
    icon: "📋",
    count: "Tüm sektörler",
    usage: "Yeni",
    href: "/cv",
    tags: ["CV", "Öz geçmiş", "Kariyer", "İK"],
  },
];

export const POPULAR_TEMPLATES = [
  { title: "AI destekli fatura itirazı", success: 87, usage: "2.450+", price: "Ücretsiz", href: "/fatura", icon: "📶" },
  { title: "AI destekli pazarlık mesajı", success: 91, usage: "3.100+", price: "Ücretsiz", href: "/pazarlik", icon: "🤝" },
  { title: "AI destekli CV taslağı", success: 88, usage: "Yeni", price: "Ücretsiz", href: "/cv", icon: "📋" },
  { title: "AI destekli tüketici dilekçesi", success: 78, usage: "1.220+", price: "Ücretsiz", href: "/dilekce", icon: "🛒" },
  { title: "AI destekli kira itirazı", success: 75, usage: "980+", price: "Ücretsiz", href: "/dilekce", icon: "🏠" },
  { title: "AI destekli belediye şikayeti", success: 85, usage: "1.540+", price: "Ücretsiz", href: "/dilekce", icon: "🏛️" },
];

export const TESTIMONIALS = [
  { name: "Ahmet K.", city: "İstanbul", type: "Fatura itirazı", text: "İnternet faturası yüksek gelmişti. AI destekli itiraz taslağını operatöre gönderdim, indirim yaptılar. Çok memnunum.", rating: 5, initials: "AK" },
  { name: "Fatma Y.", city: "Ankara", type: "Resmi yazı", text: "Belediyeye yol şikayeti yazmam gerekiyordu. AI destekli taslak 2 dakikada hazır, düzenleyip gönderdim.", rating: 5, initials: "FY" },
  { name: "Mehmet E.", city: "İzmir", type: "Pazarlık", text: "Sahibinden’de laptop alacaktım. AI destekli pazarlık mesajlarıyla satıcıyla anlaştık, istediğim fiyata indi. Harika.", rating: 5, initials: "ME" },
  { name: "Sevgi Ö.", city: "Bursa", type: "CV taslağı", text: "CV'mi güncellemem gerekiyordu. AI destekli taslak çok iyi çıktı, Word'e yapıştırıp detayları ekledim.", rating: 5, initials: "SÖ" },
];

export const FAQ_HOME = [
  { q: "Metinler yasal olarak geçerli mi?", a: "Üretilen metinler BİLGİLENDİRME AMAÇLIDIR ve taslak niteliğindedir. Hukuki, mali veya profesyonel tavsiye DEĞİLDİR. Metinler T.C. yazışma kurallarına uyumlu olacak şekilde üretilir ancak her vaka özgün olduğundan, önemli işlemlerde mutlaka yetkili bir uzmana (avukat, hukuk bürosu vb.) danışmanız gerekir. Platform sahibi, metinlerin sonuçlarından sorumlu tutulamaz." },
  { q: "Kişisel bilgilerim güvende mi?", a: "Evet. Verileriniz şifreli bağlantı ile iletilir. Metin üretmek için girdiğiniz bilgiler kalıcı hesap olmadığı sürece sunucuda saklanmaz. KVKK’ya uyumluyuz." },
  { q: "Ücretsiz plan yeterli mi?", a: "Günlük 3 kullanım ücretsiz. Denemek için yeterli. Sınırsız kullanım için Premium planı yakında." },
  { q: "Metnimi düzenleyebilir miyim?", a: "Evet. Oluşan metni kopyalayıp Word veya başka bir editörde düzenleyebilir, yazdırıp imzalayabilirsiniz. Dilekçe sayfasında yazdır / PDF kaydet de var." },
];
