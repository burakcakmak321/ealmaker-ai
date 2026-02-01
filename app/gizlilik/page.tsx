import Link from "next/link";

export default function GizlilikPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
      <Link href="/" className="mb-8 inline-block text-sm text-slate-600 hover:text-brand-600">
        ← Ana sayfa
      </Link>
      <h1 className="mb-8 text-3xl font-bold text-slate-900">Gizlilik Politikası ve KVKK Aydınlatma Metni</h1>

      <div className="prose prose-slate max-w-none space-y-6 text-slate-600">
        <p className="lead font-semibold text-slate-700">
          DealMaker AI olarak kişisel verilerinizin gizliliğine önem veriyoruz. Bu sayfa, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında bilgilendirme yapar.
        </p>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-slate-800">1. Veri Sorumlusu</h2>
          <p>
            Kişisel verileriniz, DealMaker AI (platform sahibi) tarafından işlenmektedir.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-slate-800">2. Toplanan Kişisel Veriler</h2>
          <p>
            Platform kullanımınız sırasında aşağıdaki veriler toplanabilir:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Metin içeriği:</strong> Dilekçe veya itiraz metni oluşturmak için girdiğiniz bilgiler (kurum adı, konu, detay, tarih vb.).</li>
            <li><strong>Teknik veriler:</strong> IP adresi, tarayıcı bilgisi, cihaz türü, erişim zamanı (sunucu logları).</li>
            <li><strong>Kullanım verileri:</strong> Hangi modülleri kullandığınız, üretilen metin sayısı (localStorage - tarayıcınızda saklanır, sunucuya gönderilmez).</li>
            <li><strong>İletişim bilgileri:</strong> İletişim formunu kullanırsanız ad, e-posta, mesaj içeriği.</li>
          </ul>
          <p className="font-semibold text-amber-700">
            ⚠️ <strong>Önemli:</strong> Metin oluşturmak için girdiğiniz bilgiler (dilekçe içeriği, kurum adı vb.), yapay zeka API&apos;sine (örn. OpenAI) gönderilir. Bu süreçte 3. taraf servislerin gizlilik politikaları geçerlidir.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-slate-800">3. Kişisel Verilerin İşlenme Amaçları</h2>
          <p>
            Verileriniz şu amaçlarla işlenir:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Dilekçe, itiraz veya pazarlık metinlerini üretmek</li>
            <li>Hizmetin sunulması ve iyileştirilmesi</li>
            <li>Teknik destek ve kullanıcı taleplerine yanıt</li>
            <li>Yasal yükümlülüklerin yerine getirilmesi</li>
            <li>Güvenlik ve kötüye kullanım önlemleri</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-slate-800">4. Veri Saklama Süresi</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Metin oluşturma verileri:</strong> Kalıcı kullanıcı hesabı olmadığı sürece sunucuda saklanmaz. Üretilen metinler anında size iletilir ve silinir.</li>
            <li><strong>Sunucu logları:</strong> Güvenlik ve teknik analiz amaçlı en fazla 30 gün saklanır.</li>
            <li><strong>İletişim kayıtları:</strong> Talebiniz sonuçlanana kadar veya yasal zorunluluk süresi boyunca saklanır.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-slate-800">5. Verilerin Aktarımı ve Paylaşımı</h2>
          <p>
            Kişisel verileriniz şu durumlarda 3. taraflara aktarılabilir:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Yapay zeka servisleri:</strong> Metin üretmek için OpenAI veya benzeri API&apos;ler kullanılır. Bu servislerin kendi gizlilik politikaları uygulanır.</li>
            <li><strong>Hosting ve altyapı:</strong> Sunucu ve hosting sağlayıcıları (Vercel, AWS vb.).</li>
            <li><strong>Yasal zorunluluk:</strong> Mahkeme kararı, savcılık talebi veya yasal yükümlülük halinde yetkili makamlara.</li>
          </ul>
          <p className="font-semibold">
            ⚠️ Verileriniz ticari amaçla 3. taraflara satılmaz veya kiralanmaz.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-slate-800">6. Çerezler (Cookies)</h2>
          <p>
            Platform, kullanıcı deneyimini iyileştirmek için çerezler kullanabilir:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Zorunlu çerezler:</strong> Sitenin çalışması için gerekli teknik çerezler.</li>
            <li><strong>Analitik çerezler:</strong> Kullanım istatistikleri (anonim).</li>
            <li><strong>localStorage:</strong> Ücretsiz kullanım sayacı gibi veriler tarayıcınızda saklanır, sunucuya gönderilmez.</li>
          </ul>
          <p>
            Tarayıcı ayarlarınızdan çerezleri silebilir veya engelleyebilirsiniz.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-slate-800">7. KVKK Kapsamında Haklarınız</h2>
          <p>
            6698 sayılı KVKK&apos;nın 11. maddesi uyarınca haklarınız:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
            <li>İşlenmişse buna ilişkin bilgi talep etme</li>
            <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
            <li>Yurt içinde veya yurt dışında aktarıldığı 3. kişileri bilme</li>
            <li>Verilerin eksik veya yanlış işlenmişse düzeltilmesini isteme</li>
            <li>Verilerin silinmesini veya yok edilmesini isteme</li>
            <li>Yapılan düzeltme/silme/yok etme işlemlerinin 3. taraflara bildirilmesini isteme</li>
            <li>Münhasıran otomatik sistemlerle analiz edilmesi nedeniyle aleyhine sonuç çıkmasına itiraz etme</li>
            <li>Kanuna aykırı işleme nedeniyle zarar görürseniz zararın giderilmesini talep etme</li>
          </ul>
          <p className="font-semibold">
            Haklarınızı kullanmak için <Link href="/iletisim" className="text-brand-600 hover:underline">İletişim</Link> sayfası üzerinden başvurabilirsiniz.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-slate-800">8. Güvenlik</h2>
          <p>
            Kişisel verilerinizin güvenliği için:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>HTTPS (SSL/TLS) şifreli bağlantı kullanılır</li>
            <li>Sunucu ve veritabanı güvenlik önlemleri alınmıştır</li>
            <li>Yetkisiz erişim ve veri sızıntısına karşı teknik tedbirler uygulanır</li>
          </ul>
          <p>
            Ancak, internet üzerinden veri iletiminde %100 güvenlik garantisi verilemez.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-slate-800">9. Çocukların Gizliliği</h2>
          <p>
            Platform, 18 yaş altı çocuklar için tasarlanmamıştır. Bilerek 18 yaş altından veri toplamayız. Ebeveyn veya vasinin izni olmadan çocuklar bu hizmeti kullanmamalıdır.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-slate-800">10. Politika Değişiklikleri</h2>
          <p>
            Bu gizlilik politikası zaman zaman güncellenebilir. Önemli değişiklikler sitede duyurulur. Güncel metni düzenli olarak kontrol etmeniz önerilir.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-slate-800">11. İletişim</h2>
          <p>
            Gizlilik, KVKK hakları veya veri güvenliği ile ilgili sorularınız için:{" "}
            <Link href="/iletisim" className="text-brand-600 hover:underline font-semibold">
              İletişim sayfası
            </Link>
          </p>
        </section>
      </div>

      <p className="mt-12 text-sm text-slate-500">
        Son güncelleme: {new Date().toLocaleDateString("tr-TR")} — KVKK uyumlu aydınlatma metni.
      </p>
    </div>
  );
}
