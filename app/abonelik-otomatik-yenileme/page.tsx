import PageHeader from "@/components/PageHeader";
import { BUSINESS, SITE_NAME } from "@/lib/brand";
import { PRICES } from "@/lib/pricing";

export const metadata = {
  title: `Abonelik ve Otomatik Yenileme | ${SITE_NAME}`,
  description: "Abonelik yenileme, iptal ve ücretlendirme koşulları.",
};

export default function AbonelikYenilemePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
      <PageHeader
        title="Abonelik ve Otomatik Yenileme"
        description="Aylık ve yıllık aboneliklerin yenilenmesi, iptali ve ücretlendirme koşulları."
        icon="🔁"
      />

      <div className="prose prose-slate max-w-none space-y-6 text-slate-600">
        <section>
          <h2 className="mb-3 text-xl font-bold text-slate-800">1. Abonelik Türleri</h2>
          <ul className="list-disc space-y-2 pl-6">
            <li><strong>Premium Aylık:</strong> {PRICES.pro.discounted} ₺/ay</li>
            <li><strong>Premium Yıllık:</strong> {PRICES.yearly.discounted} ₺/yıl</li>
            <li><strong>Tek Seferlik:</strong> {PRICES.onetime.discounted} ₺ ({PRICES.onetime.credits} kullanım)</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-slate-800">2. Otomatik Yenileme</h2>
          <p>
            Aylık ve yıllık abonelikler, dönem sonunda otomatik olarak yenilenir. Yenileme,
            ödeme sırasında kullanılan kart üzerinden tahsil edilir.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-slate-800">3. İptal İşlemleri</h2>
          <p>
            Abonelik iptali için <strong>İletişim</strong> sayfası üzerinden talep oluşturabilirsiniz.
            İptal, bir sonraki yenileme dönemi için geçerli olur; mevcut dönem sonuna kadar
            erişim devam eder.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-slate-800">4. Ücretlendirme ve İade</h2>
          <p>
            Dijital hizmetlerde cayma hakkı, hizmet ifasına başlanması halinde sınırlanabilir.
            Yasal zorunluluk halinde iade yapılır. Detaylar için <strong>İade ve İptal Politikası</strong>
            sayfasını inceleyin.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-slate-800">5. İletişim</h2>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm">
            <p><strong>Satıcı:</strong> {BUSINESS.unvan}</p>
            <p><strong>E‑posta:</strong> {BUSINESS.email}</p>
            <p><strong>Telefon:</strong> {BUSINESS.telefon}</p>
          </div>
        </section>
      </div>
    </div>
  );
}