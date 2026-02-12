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
            <strong>SATICI:</strong> YazıAsistan platformunu işleten <strong>Burak Çakmak</strong> (bundan sonra “Satıcı”).
          </p>
          <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
            <p><strong>Vergi Dairesi:</strong> Çorlu Vergi Dairesi Müdürlüğü</p>
            <p><strong>VKN:</strong> 2230877647</p>
            <p><strong>Adres:</strong> Şeyhsinan Mahallesi, Karasüleyman Sokak No: 2/5, Çorlu / Tekirdağ</p>
            <p><strong>Telefon:</strong> 0551 633 38 94</p>
            <p><strong>E‑posta:</strong> yaziasistani@gmail.com</p>
          </div>
          <p className="mt-3">
            <strong>ALICI:</strong> Sözleşmeyi elektronik ortamda kabul eden ve ödeme yapan müşteri (bundan sonra “Alıcı”).
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-slate-800">2. Sözleşmenin Konusu</h2>
          <p>
            Bu sözleşme, Alıcının Satıcıya ait YazıAsistan platformu üzerinden dijital hizmet/abonelik satın almasına ilişkin tarafların hak ve yükümlülüklerini düzenler.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-slate-800">3. Hizmetin Tanımı</h2>
          <p>
            YazıAsistan; yapay zeka destekli metin taslağı üretimi (fatura itirazı, pazarlık mesajı, resmi yazı/dilekçe taslağı, CV taslağı) hizmeti sunar. Hizmet, dijital içerik niteliğindedir.
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li><strong>Premium Aylık:</strong> 99 ₺/ay</li>
            <li><strong>Premium Yıllık:</strong> 999 ₺/yıl</li>
            <li><strong>Tek Seferlik:</strong> 29 ₺ (2 kullanım)</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-slate-800">4. Fiyat ve Ödeme</h2>
          <p>
            Hizmet bedeli site üzerinde belirtilen güncel fiyatlardır. Ödeme kredi kartı ile alınır. Vergisel yükümlülükler ve faturalama mevzuata uygun şekilde yapılır.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-slate-800">5. Cayma Hakkı</h2>
          <p>
            Mesafeli Sözleşmeler Yönetmeliği’nin 15. maddesi uyarınca, dijital içerik niteliğindeki hizmetlerde, Alıcı’nın onayı ile hizmet ifasına başlanması halinde cayma hakkı kullanılamaz. Hizmet, ödeme onayıyla derhal başlatılır. Alıcı, ödeme öncesinde Ön Bilgilendirme Formu’nu okuyup onaylayarak bu durumu kabul eder.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-slate-800">6. İade, İptal ve Abonelik Yenileme</h2>
          <p>
            Abonelikler aylık veya yıllık olarak <strong>otomatik yenilenir</strong>. Alıcı, yenileme tarihinden önce iptal talebinde bulunabilir. İptal talepleri <Link href="/iletisim" className="text-brand-600 hover:underline">İletişim</Link> sayfasından alınır.
          </p>
          <p>
            Dijital hizmetlerde cayma hakkı kural olarak sınırlıdır. Yasal zorunluluk bulunan durumlarda iade yapılır; değerlendirme süreci ödeme tarihinden itibaren <strong>5 iş günü</strong> içinde sonuçlandırılır.
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
