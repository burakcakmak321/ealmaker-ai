import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { BUSINESS, SITE_NAME } from "@/lib/brand";

export const metadata = {
  title: `İade ve İptal Politikası | ${SITE_NAME}`,
  description: "İade, iptal ve cayma hakkı koşulları hakkında bilgilendirme.",
};

export default function IadeIptalPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
      <PageHeader
        title="İade ve İptal Politikası"
        description="Dijital hizmetlerde iade, iptal ve cayma hakkı koşulları."
        icon="↩️"
      />

      <div className="prose prose-slate max-w-none space-y-6 text-slate-600">
        <section>
          <h2 className="mb-3 text-xl font-bold text-slate-800">1. Genel İlkeler</h2>
          <p>
            YazıAsistan dijital içerik niteliğinde hizmet sunar. Ödeme onayıyla hizmet ifasına
            başlanır ve erişim derhal sağlanır.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-slate-800">2. Cayma Hakkı</h2>
          <p>
            Mesafeli Sözleşmeler Yönetmeliği’nin 15. maddesi uyarınca, dijital içerik
            niteliğindeki hizmetlerde, tüketicinin açık onayı ile hizmet ifasına başlanması
            halinde cayma hakkı kullanılamaz.
          </p>
          <p className="font-semibold text-amber-700">
            Ödeme ekranında onay vererek, hizmetin ifasına derhal başlanacağını ve cayma
            hakkının sınırlanacağını kabul etmiş olursunuz.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-slate-800">3. İade Koşulları</h2>
          <p>
            Yasal zorunluluk bulunan durumlarda iade yapılır. İade talepleri ödeme tarihinden
            itibaren 5 iş günü içinde değerlendirilir ve sonuçlandırılır.
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>Hizmet erişimi teknik bir hata nedeniyle sağlanamadıysa,</li>
            <li>Ödeme alınıp hizmet aktive edilemediyse,</li>
            <li>Yasal mevzuat gereği iade zorunluluğu doğarsa.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-slate-800">4. İptal İşlemleri</h2>
          <p>
            Abonelik iptali için <Link href="/iletisim" className="font-semibold text-brand-600 hover:underline">İletişim</Link>{" "}
            sayfasından talep oluşturabilirsiniz. İptal, bir sonraki yenileme dönemine kadar
            geçerli olur; mevcut dönem sonuna kadar kullanım devam eder.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-slate-800">5. İletişim</h2>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm">
            <p><strong>Satıcı:</strong> {BUSINESS.unvan}</p>
            <p><strong>Vergi Dairesi:</strong> {BUSINESS.vergiDairesi}</p>
            <p><strong>VKN:</strong> {BUSINESS.vkn}</p>
            <p><strong>E‑posta:</strong> {BUSINESS.email}</p>
            <p><strong>Telefon:</strong> {BUSINESS.telefon}</p>
          </div>
        </section>
      </div>
    </div>
  );
}