import PageHeader from "@/components/PageHeader";
import { SITE_NAME } from "@/lib/brand";

export const metadata = {
  title: `Güvenlik Politikası | ${SITE_NAME}`,
  description: "SSL/TLS, veri koruma, erişim kontrolleri ve güvenlik uygulamaları hakkında bilgilendirme.",
};

export default function GuvenlikPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
      <PageHeader
        title="Güvenlik Politikası"
        description="Veri güvenliği, SSL/TLS şifreleme ve altyapı koruma önlemleri."
        icon="🛡️"
      />

      <div className="prose prose-slate max-w-none space-y-6 text-slate-600">
        <section>
          <h2 className="mb-3 text-xl font-bold text-slate-800">1. Güvenli İletişim (SSL/TLS)</h2>
          <p>
            Web sitemizde yapılan tüm veri iletimi SSL/TLS ile şifrelenir. Bu sayede kullanıcı
            verileri üçüncü kişilerin erişimine karşı korunur.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-slate-800">2. Erişim Kontrolleri</h2>
          <p>
            Sistemlerimize erişim, yetki temelli olarak sınırlandırılır. Yönetim paneli ve kritik
            operasyonlar yalnızca yetkili kişiler tarafından yürütülür.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-slate-800">3. Ödeme Güvenliği</h2>
          <p>
            Ödeme işlemleri güvenli ödeme altyapıları üzerinden yürütülür. Kart bilgileriniz
            platformumuzda tutulmaz; doğrudan ödeme sağlayıcısı tarafından işlenir.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-slate-800">4. Veri Koruma ve Gizlilik</h2>
          <p>
            Kişisel verileriniz KVKK kapsamında işlenir. Verileriniz üçüncü taraflarla ticari
            amaçla paylaşılmaz. Detaylar için Gizlilik Politikası sayfamızı inceleyiniz.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-slate-800">5. Olay Yönetimi</h2>
          <p>
            Güvenlik ihlali şüphesi halinde olaylar değerlendirilir ve gerekli teknik/idari
            önlemler alınır. Yasal yükümlülükler kapsamında kullanıcılar bilgilendirilebilir.
          </p>
        </section>
      </div>
    </div>
  );
}