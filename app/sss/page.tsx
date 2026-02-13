import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "Sıkça Sorulan Sorular",
  description:
    "YazıAsistan hakkında sıkça sorulan sorular. Ücret, kullanım limitleri, KVKK ve hizmet kapsamı.",
};

const faqs = [
  {
    s: "YazıAsistan ne yapar?",
    c: "Fatura itirazı, pazarlık mesajları, resmi yazı taslağı ve CV taslağı oluşturur. Yapay zeka ile girdiğiniz bilgilere göre profesyonel metin taslakları üretir. Taslaklar kopyalanıp düzenlenebilir.",
  },
  {
    s: "Üretilen metinler hukuki geçerli mi?",
    c: "Hayır. Üretilen metinler bilgilendirme amaçlı taslaktır; hukuki veya mali tavsiye değildir. Avukatlık hizmeti sunulmamaktadır. Önemli işlemlerde mutlaka yetkili uzmana (avukat, mali müşavir vb.) danışınız.",
  },
  {
    s: "CV taslağı nasıl çalışır?",
    c: "Deneyim, eğitim, beceriler ve hedef pozisyonunuzu girin; AI profesyonel bir CV metni taslağı oluşturur. Taslağı Word, Canva veya LinkedIn'e yapıştırarak düzenleyebilirsiniz. Son kontrolden siz sorumlusunuz.",
  },
  {
    s: "Ücretsiz kullanım nasıl?",
    c: "Günlük 3 ücretsiz kullanım hakkınız vardır. Her gün Türkiye saatiyle gece yarısı yenilenir.",
  },
  {
    s: "Verilerim saklanıyor mu? KVKK uyumlu mu?",
    c: "6698 sayılı KVKK kapsamında kişisel verileriniz işlenir. Metin üretim verileri kalıcı sunucu kaydı tutulmadan işlenir. Detaylar için Gizlilik Politikası ve KVKK Aydınlatma Metni sayfamızı inceleyebilirsiniz.",
  },
  {
    s: "Çerezler ne için kullanılıyor?",
    c: "Oturum yönetimi, güvenlik ve kullanıcı deneyimi için çerezler kullanılır. Detaylar için Çerez Politikası sayfamıza bakınız.",
  },
  {
    s: "Hangi diller destekleniyor?",
    c: "Şu an Türkçe odaklı çalışıyoruz. Resmi yazı taslakları ve CV taslakları Türkiye standartlarına uygun üretilir.",
  },
  {
    s: "Premium abonelik nasıl iptal edilir?",
    c: "Aylık veya yıllık Premium abonelikler otomatik yenilenir. İptal için İletişim sayfasından talep oluşturabilirsiniz. İptal bir sonraki yenileme dönemine kadar geçerli olur.",
  },
];

export default function SSSPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
      <PageHeader
        title="Sıkça Sorulan Sorular"
        description="Aklınıza takılan soruların cevapları. Bulamazsanız iletişime geçebilirsiniz."
        icon="❓"
      />

      <dl className="space-y-8">
        {faqs.map(({ s, c }) => (
          <div key={s} className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-card">
            <dt className="mb-2 font-semibold text-slate-800">{s}</dt>
            <dd className="text-slate-600">{c}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-12 text-center">
        <Link href="/iletisim" className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white transition hover:bg-brand-700">
          İletişime geç
        </Link>
      </div>
    </div>
  );
}
