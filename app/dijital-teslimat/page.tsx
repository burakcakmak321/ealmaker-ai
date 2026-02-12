import PageHeader from "@/components/PageHeader";
import { SITE_NAME } from "@/lib/brand";

export const metadata = {
  title: `Dijital Teslimat Politikası | ${SITE_NAME}`,
  description: "Dijital hizmetin teslimi, erişim ve kullanım bilgileri.",
};

export default function DijitalTeslimatPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
      <PageHeader
        title="Dijital Teslimat Politikası"
        description="Dijital içerik hizmetlerinin teslim ve erişim koşulları."
        icon="📦"
      />

      <div className="prose prose-slate max-w-none space-y-6 text-slate-600">
        <section>
          <h2 className="mb-3 text-xl font-bold text-slate-800">1. Teslimat Şekli</h2>
          <p>
            YazıAsistan dijital bir hizmettir. Ödeme onayıyla birlikte erişim otomatik olarak
            sağlanır ve hizmet ifasına derhal başlanır.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-slate-800">2. Erişim Süresi</h2>
          <ul className="list-disc space-y-2 pl-6">
            <li>Premium Aylık: 1 ay boyunca sınırsız erişim</li>
            <li>Premium Yıllık: 1 yıl boyunca sınırsız erişim</li>
            <li>Tek Seferlik: 2 kullanım hakkı</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-slate-800">3. Teslimat Sorunları</h2>
          <p>
            Ödeme tamamlandığı halde erişim sağlanamazsa, kullanıcı destek kanalları üzerinden
            bildirimde bulunabilir. Teknik doğrulama sonrası gerekli düzeltme yapılır.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-slate-800">4. İletişim</h2>
          <p>
            Teslimat ve erişim sorunları için İletişim sayfası üzerinden bizimle
            irtibata geçebilirsiniz.
          </p>
        </section>
      </div>
    </div>
  );
}