import Link from "next/link";
import PageHeader from "@/components/PageHeader";

export const metadata = {
  title: "Çerez Politikası | YazıAsistan",
  description: "YazıAsistan çerez kullanımı, türleri ve yönetim tercihleriniz hakkında bilgilendirme.",
};

export default function CerezlerPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
      <PageHeader
        title="Çerez Politikası"
        description="Platformumuzda kullanılan çerezler, türleri ve nasıl yönetebileceğiniz hakkında bilgilendirme."
        icon="🍪"
      />

      <div className="prose prose-slate max-w-none space-y-6 text-slate-600">
        <section>
          <h2 className="mb-3 text-xl font-bold text-slate-800">1. Çerez Nedir?</h2>
          <p>
            Çerezler, web siteleri tarafından cihazınıza (bilgisayar, tablet, telefon) kaydedilen küçük metin dosyalarıdır. Tarayıcınız her siteyi ziyaret ettiğinizde bu dosyaları ilgili siteye geri gönderir. Böylece site sizi tanıyabilir, tercihlerinizi hatırlayabilir ve kullanıcı deneyimini iyileştirebilir.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-slate-800">2. Kullandığımız Çerez Türleri</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-slate-200 text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="border-b border-slate-200 px-4 py-3 text-left font-semibold text-slate-800">Tür</th>
                  <th className="border-b border-slate-200 px-4 py-3 text-left font-semibold text-slate-800">Amaç</th>
                  <th className="border-b border-slate-200 px-4 py-3 text-left font-semibold text-slate-800">Zorunluluk</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="border-b border-slate-100 px-4 py-3">Oturum çerezleri</td><td className="border-b border-slate-100 px-4 py-3">Giriş yapmış kullanıcıyı tanıma</td><td className="border-b border-slate-100 px-4 py-3">Zorunlu</td></tr>
                <tr><td className="border-b border-slate-100 px-4 py-3">Güvenlik çerezleri</td><td className="border-b border-slate-100 px-4 py-3">Kimlik doğrulama ve güvenli erişim</td><td className="border-b border-slate-100 px-4 py-3">Zorunlu</td></tr>
                <tr><td className="border-b border-slate-100 px-4 py-3">Tercih çerezleri</td><td className="border-b border-slate-100 px-4 py-3">Dil, tema, çerez onayı</td><td className="border-b border-slate-100 px-4 py-3">İsteğe bağlı</td></tr>
                <tr><td className="border-b border-slate-100 px-4 py-3">Analitik çerezler</td><td className="border-b border-slate-100 px-4 py-3">Anonim ziyaret istatistikleri</td><td className="border-b border-slate-100 px-4 py-3">İsteğe bağlı</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-slate-800">3. localStorage ve sessionStorage</h2>
          <p>
            Tarayıcıda sunucuya gönderilmeyen veriler (örn. ücretsiz kullanım sayacı, geçici form verileri) localStorage veya sessionStorage ile saklanabilir. Bunlar çerez değildir ancak benzer işlev görür. Veriler sadece sizin cihazınızda tutulur.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-slate-800">4. Çerezleri Nasıl Yönetebilirsiniz?</h2>
          <p>Tarayıcı ayarlarınızdan çerezleri silebilir veya engelleyebilirsiniz:</p>
          <ul className="list-disc space-y-1 pl-6">
            <li><strong>Chrome:</strong> Ayarlar → Gizlilik ve güvenlik → Çerezler ve diğer site verileri</li>
            <li><strong>Firefox:</strong> Ayarlar → Gizlilik ve Güvenlik → Çerezler ve Site Verileri</li>
            <li><strong>Safari:</strong> Tercihler → Gizlilik → Çerezler ve web sitesi verileri</li>
            <li><strong>Edge:</strong> Ayarlar → Çerezler ve site izinleri</li>
          </ul>
          <p className="mt-3 font-semibold text-amber-700">
            Zorunlu çerezleri engellerseniz oturum açma, metin oluşturma gibi temel özellikler çalışmayabilir.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-slate-800">5. Güncellemeler</h2>
          <p>
            Bu politika güncellendiğinde sitede duyurulur. Güncel metni düzenli kontrol etmeniz önerilir.
          </p>
        </section>
      </div>

      <p className="mt-10 text-sm text-slate-500">
        Detaylı veri işleme bilgisi için <Link href="/gizlilik" className="text-brand-600 hover:underline">Gizlilik Politikası</Link> sayfamızı inceleyebilirsiniz.
      </p>
    </div>
  );
}
