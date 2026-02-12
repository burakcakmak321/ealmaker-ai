import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { BUSINESS, SITE_NAME } from "@/lib/brand";

export const metadata = {
  title: `Destek ve Şikayet | ${SITE_NAME}`,
  description: "Destek kanalları, şikayet süreci ve başvuru usulleri.",
};

export default function DestekSikayetPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
      <PageHeader
        title="Destek ve Şikayet Prosedürü"
        description="Destek talepleri, şikayet ve başvuru süreci hakkında bilgilendirme."
        icon="🧩"
      />

      <div className="prose prose-slate max-w-none space-y-6 text-slate-600">
        <section>
          <h2 className="mb-3 text-xl font-bold text-slate-800">1. Destek Kanalları</h2>
          <p>
            Destek taleplerinizi <strong>İletişim</strong> sayfası üzerinden iletebilirsiniz.
            Talebiniz incelenir ve en kısa sürede dönüş sağlanır.
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>Genel sorular</li>
            <li>Ödeme ve abonelik işlemleri</li>
            <li>Teknik destek</li>
            <li>KVKK başvuruları</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-slate-800">2. Şikayet Süreci</h2>
          <p>
            Şikayetlerinizi İletişim sayfası üzerinden iletebilirsiniz. Şikayetler,
            kayıt altına alınır ve değerlendirilir.
          </p>
          <p className="font-semibold text-amber-700">
            KVKK başvuruları ve veri talepleri 30 gün içinde yanıtlanır.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-slate-800">3. Uyuşmazlık Durumu</h2>
          <p>
            Taraflar arasında uyuşmazlık oluşması halinde önce çözüm için iletişim kanalları
            kullanılır. Sonuç alınamazsa tüketici hakem heyetleri veya tüketici mahkemeleri
            yetkilidir.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-slate-800">4. İletişim Bilgileri</h2>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm">
            <p><strong>Satıcı:</strong> {BUSINESS.unvan}</p>
            <p><strong>Telefon:</strong> {BUSINESS.telefon}</p>
            <p><strong>E‑posta:</strong> {BUSINESS.email}</p>
          </div>
          <p className="mt-3">
            Başvuru yapmak için <Link href="/iletisim" className="font-semibold text-brand-600 hover:underline">İletişim</Link> sayfasını kullanın.
          </p>
        </section>
      </div>
    </div>
  );
}