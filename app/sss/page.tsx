import Link from "next/link";

const faqs = [
  {
    s: "DealMaker AI ne yapar?",
    c: "Fatura itirazı, pazarlık mesajları ve resmi dilekçe metinlerini yapay zeka ile sizin yerinize yazar. Kurum adı, konu ve detayları girdiğinizde profesyonel bir metin üretir; kopyalayıp kullanabilirsiniz.",
  },
  {
    s: "Ücretsiz kullanım nasıl?",
    c: "İlk 2 kullanım (hangi modülde olursa olsun toplam 2) ücretsizdir. Sonrasında Pro üyelik ile sınırsız kullanım planlanmaktadır. Ödeme entegrasyonu eklendiğinde bu sayfa güncellenecektir.",
  },
  {
    s: "Verilerim saklanıyor mu?",
    c: "Şu anki sürümde metin üretmek için girdiğiniz bilgiler yalnızca yanıt almak için kullanılır; kalıcı hesap olmadığı sürece sunucuda saklanmaz. Ücretsiz kullanım sayacı tarayıcı belleğinde (localStorage) tutulur.",
  },
  {
    s: "Üretilen metinler hukuki geçerli mi?",
    c: "Metinler bilgilendirme amaçlıdır; hukuki veya mali tavsiye niteliği taşımaz. Önemli işlemler öncesinde ilgili kurum veya bir hukuk danışmanına danışmanız önerilir.",
  },
  {
    s: "Hangi diller destekleniyor?",
    c: "Şu an Türkçe odaklı çalışıyoruz. Resmi dile ve Türkiye mevzuatına uygun dilekçe ve itiraz metinleri üretilir.",
  },
  {
    s: "Pro ne zaman gelecek?",
    c: "Pro planı ve ödeme entegrasyonu (Stripe vb.) backend tamamlandıktan sonra eklenecek. Gelişmelerden haberdar olmak için siteyi takip edebilir veya iletişim sayfasından yazabilirsiniz.",
  },
];

export default function SSSPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:py-24">
      <Link href="/" className="mb-8 inline-block text-sm text-slate-600 hover:text-brand-600">
        ← Ana sayfa
      </Link>
      <h1 className="mb-4 text-3xl font-bold text-slate-900">Sıkça Sorulan Sorular</h1>
      <p className="mb-12 text-slate-600">
        Aklınıza takılan soruların cevapları aşağıda. Bulamazsanız{" "}
        <Link href="/iletisim" className="text-brand-600 hover:underline">
          iletişime geçin
        </Link>
        .
      </p>

      <dl className="space-y-8">
        {faqs.map(({ s, c }) => (
          <div key={s} className="border-b border-slate-200 pb-8 last:border-0">
            <dt className="mb-2 font-semibold text-slate-800">{s}</dt>
            <dd className="text-slate-600">{c}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
