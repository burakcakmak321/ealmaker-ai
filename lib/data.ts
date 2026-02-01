/** Ana sayfa ve şablon verileri */

export const STATS = [
  { label: "Oluşturulan metin", value: "12.400+", icon: "📄" },
  { label: "Aktif kullanıcı", value: "2.800+", icon: "👥" },
  { label: "Şablon / senaryo", value: "50+", icon: "📋" },
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
    title: "3 güçlü modül, onlarca senaryo",
    description: "Fatura itirazı, pazarlık mesajları ve resmi dilekçe. Her modülde hazır senaryolar; kurum ve konuya göre metin üretilir.",
    icon: "📋",
    items: ["Fatura & abonelik itirazı", "Pazarlık mesajları", "Belediye, mahkeme, tüketici dilekçeleri"],
  },
  {
    title: "Saniyeler içinde hazır",
    description: "Karmaşık formlar yok. Birkaç alan doldur, yapay zeka profesyonel metni yazar. Zaman kaybı yok.",
    icon: "⚡",
    items: ["Kurum / konu gir", "İsteğe detay ekle", "Metni al, kopyala veya yazdır"],
  },
  {
    title: "T.C. standartlarında",
    description: "Tüm metinler resmi yazışma kurallarına ve dilekçe formatına uyumlu. Kurumun dilinde, hukuki jargonla.",
    icon: "🇹🇷",
    items: ["Resmi hitap ve sonuç", "657 DMK uyumlu dilekçe", "İkna edici pazarlık metni"],
  },
  {
    title: "PDF & yazdır",
    description: "Metni kopyala, Word’e yapıştır veya tarayıcıdan PDF olarak kaydet. Yazdır, imzala, gönder.",
    icon: "📥",
    items: ["Tek tıkla kopyala", "Yazdır / PDF kaydet", "Dilekçe için imza alanı"],
  },
  {
    title: "Yapay zeka asistan",
    description: "Ne yazacağını bilmiyorsan bile konuyu kısaca anlat; AI senin için doğru metni üretsin.",
    icon: "🤖",
    items: ["Serbest metin destekli", "Kurum ve konuya göre uyarlama", "Hukuki ifadeler"],
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
    title: "Fatura & Abonelik",
    description: "İnternet, banka, operatör faturası; aidat ve abonelik itirazları",
    icon: "📄",
    count: "15+ senaryo",
    usage: "8.2K kullanım",
    href: "/fatura",
    tags: ["İnternet faturası", "Banka aidatı", "Operatör iptali", "+12"],
  },
  {
    title: "Pazarlık",
    description: "Sahibinden, Letgo, eBay — satıcıya profesyonel pazarlık mesajları",
    icon: "🤝",
    count: "10+ senaryo",
    usage: "5.1K kullanım",
    href: "/pazarlik",
    tags: ["Sahibinden", "Letgo", "eBay", "+7"],
  },
  {
    title: "Belediye & Kamu",
    description: "Yol, çöp, park, imar; belediye ve kamu kurumlarına dilekçe",
    icon: "🏛️",
    count: "12 şablon",
    usage: "4.8K kullanım",
    href: "/dilekce",
    tags: ["Yol onarım", "Çöp şikayeti", "Park talebi", "+9"],
  },
  {
    title: "Tüketici & İade",
    description: "Ürün iadesi, cayma hakkı, garanti, ayıplı mal şikayeti",
    icon: "🛒",
    count: "8 şablon",
    usage: "3.2K kullanım",
    href: "/dilekce",
    tags: ["İade", "Şikayet", "Cayma hakkı", "+5"],
  },
  {
    title: "Kira & Taşınmaz",
    description: "Kira artışı itirazı, tahliye, depozito, sözleşme feshi",
    icon: "🏠",
    count: "6 şablon",
    usage: "2.1K kullanım",
    href: "/dilekce",
    tags: ["Kira itirazı", "Depozito", "Fesih", "+3"],
  },
  {
    title: "Mahkeme & Hukuk",
    description: "Boşanma, velayet, nafaka, icra; mahkeme dilekçeleri",
    icon: "⚖️",
    count: "10 şablon",
    usage: "1.9K kullanım",
    href: "/dilekce",
    tags: ["Boşanma", "Velayet", "İcra", "+7"],
  },
];

export const POPULAR_TEMPLATES = [
  { title: "İnternet faturası itirazı", success: 87, usage: "2.450+", price: "Ücretsiz", href: "/fatura", icon: "📶" },
  { title: "Banka aidatı iadesi", success: 82, usage: "1.890+", price: "Ücretsiz", href: "/fatura", icon: "🏦" },
  { title: "Sahibinden pazarlık", success: 91, usage: "3.100+", price: "Ücretsiz", href: "/pazarlik", icon: "🤝" },
  { title: "Tüketici hakem heyeti", success: 78, usage: "1.220+", price: "Ücretsiz", href: "/dilekce", icon: "🛒" },
  { title: "Kira artışı itirazı", success: 75, usage: "980+", price: "Ücretsiz", href: "/dilekce", icon: "🏠" },
  { title: "Belediye şikayeti", success: 85, usage: "1.540+", price: "Ücretsiz", href: "/dilekce", icon: "🏛️" },
];

export const TESTIMONIALS = [
  { name: "Ahmet K.", city: "İstanbul", type: "Fatura itirazı", text: "İnternet faturası yüksek gelmişti. Bu siteyle yazdığım itiraz metnini operatöre gönderdim, indirim yaptılar. Çok memnunum.", rating: 5, initials: "AK" },
  { name: "Fatma Y.", city: "Ankara", type: "Dilekçe", text: "Belediyeye yol şikayeti dilekçesi yazmam gerekiyordu. 2 dakikada profesyonel metin hazırladım, kabul edildi.", rating: 5, initials: "FY" },
  { name: "Mehmet E.", city: "İzmir", type: "Pazarlık", text: "Sahibinden’de laptop alacaktım. Hazırladığı mesajlarla satıcıyla anlaştık, istediğim fiyata indi. Harika.", rating: 5, initials: "ME" },
  { name: "Sevgi Ö.", city: "Bursa", type: "Tüketici dilekçesi", text: "Mağazadan iade talebim reddedilmişti. Tüketici hakem heyeti dilekçesini buradan hazırladım, sonuç aldım.", rating: 5, initials: "SÖ" },
];

export const FAQ_HOME = [
  { q: "Metinler yasal olarak geçerli mi?", a: "Üretilen metinler BİLGİLENDİRME AMAÇLIDIR ve taslak niteliğindedir. Hukuki, mali veya profesyonel tavsiye DEĞİLDİR. Metinler T.C. yazışma kurallarına uyumlu olacak şekilde üretilir ancak her vaka özgün olduğundan, önemli işlemlerde mutlaka yetkili bir uzmana (avukat, hukuk bürosu vb.) danışmanız gerekir. Platform sahibi, metinlerin sonuçlarından sorumlu tutulamaz." },
  { q: "Kişisel bilgilerim güvende mi?", a: "Evet. Verileriniz şifreli bağlantı ile iletilir. Metin üretmek için girdiğiniz bilgiler kalıcı hesap olmadığı sürece sunucuda saklanmaz. KVKK’ya uyumluyuz." },
  { q: "Ücretsiz plan yeterli mi?", a: "İlk 2 kullanım ücretsiz. Denemek için yeterli. Sınırsız kullanım ve ek özellikler için Pro planını öneriyoruz." },
  { q: "Metnimi düzenleyebilir miyim?", a: "Evet. Oluşan metni kopyalayıp Word veya başka bir editörde düzenleyebilir, yazdırıp imzalayabilirsiniz. Dilekçe sayfasında yazdır / PDF kaydet de var." },
];
