import Link from "next/link";
import PageHeader from "@/components/PageHeader";

export const metadata = {
  title: "Gizlilik Politikası ve KVKK | YazıAsistan",
  description: "6698 sayılı KVKK kapsamında YazıAsistan gizlilik politikası, kişisel veri işleme ve aydınlatma metni.",
};

export default function GizlilikPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
      <PageHeader
        title="Gizlilik Politikası ve KVKK Aydınlatma Metni"
        description="6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında veri sorumlusu olarak kişisel verilerinize ilişkin bilgilendirme."
        icon="🔒"
      />

      <div className="prose prose-slate max-w-none space-y-8 text-slate-600">
        <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-6">
          <p className="text-sm font-semibold text-amber-900">
            Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) ve ilgili mevzuat uyarınca hazırlanmış bilgilendirme ve aydınlatma metnidir. Platformu kullanarak bu politikayı okuduğunuzu ve kabul ettiğinizi beyan etmiş olursunuz.
          </p>
        </div>

        <section>
          <h2 className="mb-3 text-xl font-bold text-slate-800">1. Veri Sorumlusu</h2>
          <p>
            <strong>6698 sayılı KVKK&apos;nın 10. maddesi</strong> uyarınca, kişisel verilerinizin işlenmesine ilişkin veri sorumlusu sıfatıyla YazıAsistan platform sahibi yetkilidir.
          </p>
          <p>
            Veri sorumlusu, kişisel verilerin işlenme amaçlarını ve vasıtalarını belirleyen, veri kayıt sisteminin kurulmasından ve yönetilmesinden sorumlu gerçek veya tüzel kişidir.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-slate-800">2. İşlenen Kişisel Veriler ve İşleme Amaçları</h2>
          <p>Platform kullanımınız sırasında aşağıdaki kişisel veriler işlenebilmektedir:</p>
          <div className="overflow-x-auto">
            <table className="mt-4 min-w-full border border-slate-200 text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="border-b border-slate-200 px-4 py-3 text-left font-semibold text-slate-800">Veri Kategorisi</th>
                  <th className="border-b border-slate-200 px-4 py-3 text-left font-semibold text-slate-800">Örnekler</th>
                  <th className="border-b border-slate-200 px-4 py-3 text-left font-semibold text-slate-800">İşleme Amacı</th>
                  <th className="border-b border-slate-200 px-4 py-3 text-left font-semibold text-slate-800">Hukuki Sebep</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="border-b border-slate-100 px-4 py-3">Kimlik</td><td className="border-b border-slate-100 px-4 py-3">Ad, soyad</td><td className="border-b border-slate-100 px-4 py-3">Hesap oluşturma, kişiselleştirme</td><td className="border-b border-slate-100 px-4 py-3">Sözleşmenin ifası</td></tr>
                <tr><td className="border-b border-slate-100 px-4 py-3">İletişim</td><td className="border-b border-slate-100 px-4 py-3">E-posta adresi</td><td className="border-b border-slate-100 px-4 py-3">Oturum, bildirim, destek</td><td className="border-b border-slate-100 px-4 py-3">Sözleşmenin ifası</td></tr>
                <tr><td className="border-b border-slate-100 px-4 py-3">İşlem / İçerik</td><td className="border-b border-slate-100 px-4 py-3">Metin içeriği (kurum, konu, detay vb.)</td><td className="border-b border-slate-100 px-4 py-3">Metin üretimi, hizmet sunumu</td><td className="border-b border-slate-100 px-4 py-3">Sözleşmenin ifası</td></tr>
                <tr><td className="border-b border-slate-100 px-4 py-3">Teknik</td><td className="border-b border-slate-100 px-4 py-3">IP adresi, tarayıcı, cihaz</td><td className="border-b border-slate-100 px-4 py-3">Güvenlik, analiz, fraud önleme</td><td className="border-b border-slate-100 px-4 py-3">Meşru menfaat</td></tr>
                <tr><td className="border-b border-slate-100 px-4 py-3">Kullanım</td><td className="border-b border-slate-100 px-4 py-3">Modül kullanımı, tarih</td><td className="border-b border-slate-100 px-4 py-3">Kota yönetimi, hizmet iyileştirme</td><td className="border-b border-slate-100 px-4 py-3">Sözleşmenin ifası</td></tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 font-semibold text-amber-700">
            ⚠️ Metin oluşturmak için girdiğiniz bilgiler (dilekçe, fatura itirazı, CV vb.) yapay zeka API&apos;lerine (örn. OpenAI) işlenmek üzere iletilir. Bu servislerin kendi gizlilik politikaları geçerlidir; verileriniz 3. taraf sunucularında işlenebilir.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-slate-800">3. Kişisel Verilerin Aktarımı</h2>
          <p>Kişisel verileriniz aşağıdaki durumlarda 3. taraflara aktarılabilir:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li><strong>Yapay zeka servisleri:</strong> Metin üretimi için kullanılan API sağlayıcıları (ör. OpenAI). Veriler yurt dışına aktarılabilir; ilgili şirketlerin gizlilik politikaları uygulanır.</li>
            <li><strong>Hosting ve altyapı:</strong> Sunucu, veritabanı ve CDN sağlayıcıları (Vercel, Supabase, AWS vb.).</li>
            <li><strong>Ödeme işlemcisi:</strong> Ödeme altyapısı kullanıldığında (Param) ödeme bilgileri ilgili sağlayıcıya iletilir.</li>
            <li><strong>Yasal zorunluluk:</strong> Mahkeme kararı, savcılık talebi veya kanunen zorunlu bildirimler kapsamında yetkili makamlara.</li>
          </ul>
          <p className="font-semibold text-slate-800">
            Kişisel verileriniz ticari amaçla satılmaz, kiralanmaz veya pazarlama amaçlı 3. taraflarla paylaşılmaz.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-slate-800">4. Veri Saklama Süresi</h2>
          <ul className="list-disc space-y-2 pl-6">
            <li><strong>Hesap bilgileri:</strong> Hesabınız aktif olduğu sürece; silme talebi halinde en geç 30 gün içinde silinir.</li>
            <li><strong>Metin üretim verileri:</strong> Üretim sürecinde geçici olarak işlenir; kalıcı sunucu kaydı tutulmaz. Yapay zeka sağlayıcısının veri politikası ayrıca geçerlidir.</li>
            <li><strong>Sunucu logları:</strong> Güvenlik ve teknik analiz için en fazla 90 gün saklanabilir.</li>
            <li><strong>İletişim kayıtları:</strong> Talep sonuçlanana kadar; yasal saklama yükümlülüğü varsa bu süreye tabidir.</li>
            <li><strong>Ödeme kayıtları:</strong> Vergi ve ticaret mevzuatı gereği zorunlu saklama süreleri uygulanır.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-slate-800">5. Çerezler (Cookies) ve Benzer Teknolojiler</h2>
          <p>Platform, aşağıdaki türde çerezler ve benzeri teknolojiler kullanabilir:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li><strong>Zorunlu çerezler:</strong> Oturum yönetimi, güvenlik ve temel işlevsellik için gereklidir; reddedilemez.</li>
            <li><strong>Tercih çerezleri:</strong> Dil, tema vb. kullanıcı tercihlerini hatırlamak için.</li>
            <li><strong>Analitik çerezler:</strong> Anonim kullanım istatistikleri (ziyaret sayısı, sayfa görüntüleme).</li>
            <li><strong>localStorage / sessionStorage:</strong> Tarayıcıda tutulan, sunucuya gönderilmeyen veriler (örn. ücretsiz kullanım sayacı).</li>
          </ul>
          <p>
            Çerez tercihlerinizi tarayıcı ayarlarından yönetebilirsiniz. Detaylı bilgi için{" "}
            <Link href="/cerezler" className="font-semibold text-brand-600 hover:underline">Çerez Politikası</Link> sayfamızı inceleyebilirsiniz.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-slate-800">6. KVKK Kapsamında Haklarınız</h2>
          <p><strong>6698 sayılı KVKK&apos;nın 11. maddesi</strong> uyarınca aşağıdaki haklara sahipsiniz:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme,</li>
            <li>İşlenmişse buna ilişkin bilgi talep etme,</li>
            <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
            <li>Yurt içinde veya yurt dışında aktarıldığı 3. kişileri bilme,</li>
            <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme,</li>
            <li>KVKK&apos;nın 7. maddesinde öngörülen şartlar çerçevesinde silinmesini veya yok edilmesini isteme,</li>
            <li>Düzeltme/silme/yok etme işlemlerinin 3. taraflara bildirilmesini isteme,</li>
            <li>Münhasıran otomatik sistemlerle analiz nedeniyle aleyhinize sonuç çıkmasına itiraz etme,</li>
            <li>Kanuna aykırı işleme nedeniyle zarar gördüğünüzde zararın giderilmesini talep etme.</li>
          </ul>
          <p className="mt-4 font-semibold">
            Başvurularınızı <Link href="/iletisim" className="text-brand-600 hover:underline">İletişim</Link> sayfası üzerinden &quot;KVKK Başvurusu&quot; konusuyla iletebilirsiniz. Başvurular en geç 30 gün içinde sonuçlandırılacaktır.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-slate-800">7. Veri Güvenliği</h2>
          <p>Kişisel verilerinizin güvenliği için alınan teknik ve idari tedbirler:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>HTTPS (SSL/TLS) ile şifreli veri iletimi,</li>
            <li>Yetkisiz erişim ve veri sızıntısına karşı altyapı koruması,</li>
            <li>Erişim yetkilendirme ve denetim mekanizmaları,</li>
            <li>Düzenli güvenlik güncellemeleri.</li>
          </ul>
          <p>
            İnternet üzerinden yapılan veri iletiminde %100 güvenlik garantisi verilemez; kullanıcılar da giriş bilgilerini korumakla yükümlüdür.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-slate-800">8. Çocukların Gizliliği</h2>
          <p>
            Platform 18 yaş altı bireylere yönelik değildir. Bilerek 18 yaş altından kişisel veri toplamıyoruz. Ebeveyn veya vasi, çocuğa ait veri işlendiğini fark ederse <Link href="/iletisim" className="text-brand-600 hover:underline">İletişim</Link> üzerinden talepte bulunabilir.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-slate-800">9. Politika Güncellemeleri</h2>
          <p>
            Bu gizlilik politikası yasal değişiklikler veya hizmet güncellemeleri nedeniyle değiştirilebilir. Önemli değişiklikler sitede duyurulur; yürürlük tarihi metin içinde belirtilir. Politikanın güncel halini düzenli kontrol etmeniz önerilir.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-slate-800">10. İletişim ve Şikayet Hakkı</h2>
          <p>
            Gizlilik, KVKK hakları veya veri güvenliğiyle ilgili sorularınız için:{" "}
            <Link href="/iletisim" className="font-semibold text-brand-600 hover:underline">İletişim sayfası</Link>.
          </p>
          <p>
            Başvurunuzun sonucundan memnun kalmazsanız, <strong>Kişisel Verileri Koruma Kurumu (KVKK)</strong> nezdinde şikayette bulunma hakkınız saklıdır.
          </p>
        </section>
      </div>

      <p className="mt-12 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
        Son güncelleme: {new Date().toLocaleDateString("tr-TR")} — KVKK uyumlu aydınlatma metni. Bu metin yasal bilgilendirme amacıyla hazırlanmıştır.
      </p>
    </div>
  );
}
