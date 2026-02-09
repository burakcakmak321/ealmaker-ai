import Link from "next/link";
import PageHeader from "@/components/PageHeader";

export const metadata = {
  title: "Mesafeli Satış Sözleşmesi | YazıAsistan",
  description: "6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği kapsamında mesafeli satış sözleşmesi.",
};

export default function MesafeliSatisPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
      <PageHeader
        title="Mesafeli Satış Sözleşmesi"
        description="6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği kapsamında."
        icon="📜"
      />

      <div className="prose prose-slate max-w-none space-y-6 text-slate-600">
        <section>
          <h2 className="mb-3 text-xl font-bold text-slate-800">1. Taraflar</h2>
          <p>
            <strong>SATICI:</strong> YazıAsistan platformunu işleten gerçek veya tüzel kişi (bundan sonra &quot;Satıcı&quot;).
          </p>
          <p>
            <strong>ALICI:</strong> Sözleşmeyi elektronik ortamda kabul eden ve ödeme yapan müşteri (bundan sonra &quot;Alıcı&quot;).
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-slate-800">2. Sözleşmenin Konusu</h2>
          <p>
            Bu sözleşme, Alıcının Satıcıya ait YazıAsistan platformu üzerinden Pro abonelik hizmeti satın almasına ilişkin tarafların hak ve yükümlülüklerini düzenler.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-slate-800">3. Hizmetin Tanımı</h2>
          <p>
            Pro abonelik; metin taslağı üretimi (fatura itirazı, pazarlık, resmi yazı taslağı, CV taslağı) modüllerinde sınırsız kullanım hakkı sağlar. Hizmet dijital içerik niteliğindedir.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-slate-800">4. Fiyat ve Ödeme</h2>
          <p>
            Hizmet bedeli site üzerinde belirtilen fiyat üzerindendir. Ödeme kredi kartı veya havale/EFT ile alınır. KDV uygulanabilir.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-slate-800">5. Cayma Hakkı</h2>
          <p>
            Mesafeli Sözleşmeler Yönetmeliği&apos;nin 15. maddesi uyarınca, dijital içerik niteliğindeki hizmetlerde cayma hakkı, Alıcı onayı ile hizmetin ifasına başlanmasından sonra kullanılamaz. Pro aboneliğiniz ödeme onayıyla derhal aktifleşir. Alıcı, ödeme öncesinde Ön Bilgilendirme Formu&apos;nu okuyup onaylayarak bu durumu kabul etmiş sayılır. Hizmetin dijital olduğundan bahisle 14 günlük cayma hakkı sınırlanabilir.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-slate-800">6. İade ve Abonelik Yenileme</h2>
          <p>
            Cayma hakkı kullanılamayan hallerde, Alıcının talep etmesi ve yasal zorunluluk bulunması halinde iade yapılır. İade talepleri ödeme tarihi itibarıyla 5 iş günü içinde değerlendirilir. Abonelik aylık olarak otomatik yenilenir; iptal için <Link href="/iletisim" className="text-brand-600 hover:underline">İletişim</Link> sayfasından talepte bulunulmalıdır. İade koşulları 6502 sayılı Kanun ve ilgili mevzuata tabidir.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-slate-800">7. Sorumluluk</h2>
          <p>
            Satıcı, hizmetin sunulmasından sorumludur. Üretilen metinler taslak niteliğindedir; hukuki tavsiye değildir. Detaylar için <Link href="/kullanim" className="text-brand-600 hover:underline">Kullanım Koşulları</Link> geçerlidir.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-slate-800">8. Uyuşmazlık</h2>
          <p>
            Uyuşmazlıklarda Türkiye Cumhuriyeti yasaları uygulanır. Tüketici Hakem Heyetleri ve Tüketici Mahkemeleri yetkilidir.
          </p>
        </section>
      </div>

      <p className="mt-10 text-sm text-slate-500">
        <Link href="/" className="text-brand-600 hover:underline">← Ana sayfaya dön</Link>
      </p>
    </div>
  );
}
