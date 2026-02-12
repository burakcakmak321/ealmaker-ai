import PageHeader from "@/components/PageHeader";
import { BUSINESS, SITE_NAME } from "@/lib/brand";

export const metadata = {
  title: `Ödeme ve Faturalandırma | ${SITE_NAME}`,
  description: "Ödeme yöntemleri, faturalandırma ve tahsilat süreçleri hakkında bilgilendirme.",
};

export default function OdemeFaturalandirmaPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
      <PageHeader
        title="Ödeme ve Faturalandırma"
        description="Ödeme yöntemleri, güvenli ödeme altyapısı ve faturalandırma süreçleri."
        icon="💳"
      />

      <div className="prose prose-slate max-w-none space-y-6 text-slate-600">
        <section>
          <h2 className="mb-3 text-xl font-bold text-slate-800">1. Ödeme Yöntemleri</h2>
          <p>
            Ödemeler kredi kartı ile ve güvenli ödeme altyapısı üzerinden alınır. Kart bilgileriniz
            doğrudan ödeme sağlayıcısı tarafından işlenir ve tarafımızca saklanmaz.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-slate-800">2. Faturalandırma</h2>
          <p>
            Ödeme tamamlandıktan sonra fatura, mevzuata uygun şekilde düzenlenir ve kayıt altına
            alınır. Fatura talebiniz varsa <strong>İletişim</strong> sayfası üzerinden iletebilirsiniz.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-slate-800">3. Tahsilat ve Ödeme Güvenliği</h2>
          <ul className="list-disc space-y-2 pl-6">
            <li>3D Secure ile doğrulama</li>
            <li>SSL/TLS şifreli veri iletimi</li>
            <li>Yetkisiz erişime karşı güvenlik kontrolleri</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-slate-800">4. İade/İptal ve Abonelik</h2>
          <p>
            İade ve iptal süreçleri için <strong>İade ve İptal Politikası</strong> ile{" "}
            <strong>Abonelik ve Otomatik Yenileme</strong> sayfalarını inceleyin.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-slate-800">5. Satıcı Bilgileri</h2>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm">
            <p><strong>Satıcı:</strong> {BUSINESS.unvan}</p>
            <p><strong>Vergi Dairesi:</strong> {BUSINESS.vergiDairesi}</p>
            <p><strong>VKN:</strong> {BUSINESS.vkn}</p>
            <p><strong>Adres:</strong> {BUSINESS.adres}</p>
            <p><strong>E‑posta:</strong> {BUSINESS.email}</p>
          </div>
        </section>
      </div>
    </div>
  );
}