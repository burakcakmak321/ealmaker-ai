import PageHeader from "@/components/PageHeader";
import { SITE_NAME } from "@/lib/brand";

export const metadata = {
  title: `Uyuşmazlık Çözümü | ${SITE_NAME}`,
  description: "Uyuşmazlık çözüm yolları ve yetkili merciler hakkında bilgilendirme.",
};

export default function UyusmazlikPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
      <PageHeader
        title="Uyuşmazlık Çözümü ve Yetkili Mahkeme"
        description="Tüketici uyuşmazlıklarında başvuru yolları ve yetkili merciler."
        icon="⚖️"
      />

      <div className="prose prose-slate max-w-none space-y-6 text-slate-600">
        <section>
          <h2 className="mb-3 text-xl font-bold text-slate-800">1. Öncelikli Çözüm</h2>
          <p>
            Uyuşmazlık durumunda öncelikle <strong>İletişim</strong> sayfası üzerinden
            bizimle iletişime geçilmesi önerilir. Amacımız sorunları hızlıca çözmektir.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-slate-800">2. Resmi Başvuru Yolları</h2>
          <p>
            Çözüm sağlanamazsa, 6502 sayılı Tüketicinin Korunması Hakkında Kanun
            kapsamında tüketici hakem heyetlerine veya tüketici mahkemelerine
            başvurulabilir.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-slate-800">3. Yetkili Mahkeme</h2>
          <p>
            Uyuşmazlıklarda Türkiye Cumhuriyeti yasaları geçerlidir. Yetkili mahkeme
            ve icra daireleri, tüketicinin veya satıcının yerleşim yeri mahkemeleridir.
          </p>
        </section>
      </div>
    </div>
  );
}