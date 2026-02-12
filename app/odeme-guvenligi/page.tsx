import PageHeader from "@/components/PageHeader";
import { SITE_NAME } from "@/lib/brand";

export const metadata = {
  title: `Ödeme Güvenliği | ${SITE_NAME}`,
  description: "3D Secure, SSL/TLS ve ödeme güvenliği uygulamaları hakkında bilgilendirme.",
};

export default function OdemeGuvenligiPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
      <PageHeader
        title="Ödeme Güvenliği"
        description="3D Secure doğrulama, SSL/TLS ve güvenli ödeme altyapısı."
        icon="🔐"
      />

      <div className="prose prose-slate max-w-none space-y-6 text-slate-600">
        <section>
          <h2 className="mb-3 text-xl font-bold text-slate-800">1. Güvenli Ödeme Altyapısı</h2>
          <p>
            Ödemeler, güvenli ödeme sağlayıcıları üzerinden alınır. Kart bilgileriniz doğrudan
            ödeme sağlayıcısı tarafından işlenir ve tarafımızca saklanmaz.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-slate-800">2. 3D Secure Doğrulama</h2>
          <p>
            Ödeme işlemlerinde 3D Secure doğrulaması kullanılır. Bu doğrulama, kart sahibinin
            ek güvenlik adımıyla onay vermesini sağlar.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-slate-800">3. SSL/TLS Şifreleme</h2>
          <p>
            Web sitemizdeki tüm veri iletimi SSL/TLS ile şifrelenir. Bu sayede ödeme ve kişisel
            verileriniz güvenli şekilde aktarılır.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-slate-800">4. Güvenlik İhlali ve Bildirim</h2>
          <p>
            Olası güvenlik ihlallerinde gerekli teknik ve idari önlemler alınır. Yasal
            yükümlülükler kapsamında kullanıcılar bilgilendirilebilir.
          </p>
        </section>
      </div>
    </div>
  );
}