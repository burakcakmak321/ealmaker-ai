import PageHeader from "@/components/PageHeader";
import { BUSINESS, SITE_NAME, SITE_TAGLINE } from "@/lib/brand";

export const metadata = {
  title: `Hakkımızda | ${SITE_NAME}`,
  description: `${SITE_NAME} hakkında kurumsal bilgiler, misyon, vizyon ve hizmet kapsamı.`,
};

export default function HakkimizdaPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
      <PageHeader
        title="Hakkımızda"
        description={`${SITE_NAME} — ${SITE_TAGLINE}. Güvenilir, hızlı ve anlaşılır metin taslakları.`}
        icon="🏢"
      />

      <div className="prose prose-slate max-w-none space-y-6 text-slate-600">
        <section>
          <h2 className="mb-3 text-xl font-bold text-slate-800">Biz Kimiz?</h2>
          <p>
            {SITE_NAME}, kullanıcıların resmi ve profesyonel yazışmalarını hızlıca
            hazırlayabilmesi için geliştirilmiş yapay zeka destekli bir metin taslağı
            platformudur. Fatura itirazı, pazarlık mesajı, dilekçe ve CV gibi
            kullanım senaryolarında, Türkiye standartlarına uygun taslaklar üretir.
          </p>
          <p className="font-semibold text-amber-700">
            Üretilen metinler bilgilendirme amaçlı taslaktır; hukuki, mali veya
            profesyonel tavsiye değildir.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-slate-800">Misyonumuz</h2>
          <p>
            Herkesin anlaşılır, düzenli ve profesyonel metinlere hızlıca erişmesini
            sağlamak; kullanıcıların zaman kaybetmeden doğru formatta taslaklar
            oluşturmasına yardımcı olmak.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-slate-800">Vizyonumuz</h2>
          <p>
            Türkiye’de yapay zeka destekli metin üretiminde güven ve kalite
            standardı haline gelmek; kullanıcı odaklı, şeffaf ve güvenilir bir
            deneyim sunmak.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-slate-800">Neler Sunuyoruz?</h2>
          <ul className="list-disc space-y-2 pl-6">
            <li>AI destekli fatura itirazı, pazarlık, dilekçe ve CV taslakları</li>
            <li>Türkiye mevzuatına uyumlu, resmi dil ve format</li>
            <li>Hızlı kullanım ve kopyala‑yapıştır ile pratik teslim</li>
            <li>KVKK uyumlu veri işleme ve güvenli altyapı</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-slate-800">Şeffaflık ve Güven</h2>
          <p>
            Gizlilik ve veri güvenliği politikalarımızı açıkça paylaşıyoruz. Tüm
            ödemeler güvenli ödeme altyapıları üzerinden alınır. Kullanıcılarımızın
            verilerini ticari amaçla satmayız, kiralamayız.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-slate-800">Kurumsal Bilgiler</h2>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm">
            <p><strong>Ticari Ünvan:</strong> {BUSINESS.unvan}</p>
            <p><strong>Vergi Dairesi:</strong> {BUSINESS.vergiDairesi}</p>
            <p><strong>VKN:</strong> {BUSINESS.vkn}</p>
            <p><strong>Adres:</strong> {BUSINESS.adres}</p>
            <p><strong>Telefon:</strong> {BUSINESS.telefon}</p>
            <p><strong>E‑posta:</strong> {BUSINESS.email}</p>
          </div>
        </section>
      </div>
    </div>
  );
}