import Link from "next/link";
import PageHeader from "@/components/PageHeader";

export const metadata = {
  title: "Kullanım Koşulları | YazıAsistan",
  description: "YazıAsistan platform kullanım koşulları, sorumluluk reddi ve yasal uyarılar.",
};

export default function KullanimPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
      <PageHeader
        title="Kullanım Koşulları ve Sorumluluk Reddi"
        description="Platformu kullanmadan önce bu koşulları okumanız önemle rica edilir."
        icon="📜"
      />

      <div className="mb-8 rounded-xl border-2 border-amber-200 bg-amber-50 p-6">
        <div className="flex gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <h2 className="mb-2 font-bold text-amber-900">Önemli Yasal Uyarı</h2>
            <p className="text-sm leading-relaxed text-amber-800">
              Bu platform <strong>yalnızca bilgilendirme ve metin üretme aracıdır</strong>. Üretilen metinler (dilekçe taslağı, CV taslağı, fatura itirazı, pazarlık mesajı dahil) hukuki, mali veya profesyonel tavsiye niteliği taşımaz. 
              <strong> Avukatlık Kanunu (1136 sayılı) ve ilgili mevzuat uyarınca hukuki danışmanlık ve avukatlık hizmeti sunulmamaktadır.</strong> Kullanım tamamen sizin sorumluluğunuzdadır.
            </p>
          </div>
        </div>
      </div>

      <div className="prose prose-slate max-w-none space-y-6 text-slate-600">
        <section>
          <h2 className="mb-3 text-xl font-bold text-slate-800">1. Hizmetin Tanımı ve Kapsamı</h2>
          <p>
            YazıAsistan, yapay zeka teknolojisi kullanarak <strong>metin taslağı üretimi</strong> sunan bir platformdur. Fatura itirazı, pazarlık mesajları, resmi yazı taslakları ve CV taslağı oluşturma gibi modüller içerir.
          </p>
          <p className="font-semibold text-amber-700">
            Bu platform: Avukat, avukatlık bürosu, mali müşavir, hukuk danışmanı, kariyer danışmanı veya herhangi bir mesleki danışmanlık hizmeti DEĞİLDİR. Üretilen çıktılar yalnızca <strong>taslak / şablon</strong> niteliğindedir.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-slate-800">2. Hukuki ve Mesleki Tavsiye Reddi</h2>
          <p>
            <strong>1136 sayılı Avukatlık Kanunu</strong> ve ilgili mevzuat uyarınca, hukuki danışmanlık ve avukatlık hizmeti yalnızca baroya kayıtlı avukatlar tarafından verilebilir. Bu platform:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>Hukuki tavsiye vermez; metinler bilgilendirme amaçlı taslaktır.</li>
            <li>Mahkeme, savcılık veya resmi kurumlara sunulacak belgelerin hazırlanmasında profesyonel destek yerine geçmez.</li>
            <li>Önemli hukuki işlemlerde mutlaka bir avukata danışmanız önerilir.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-slate-800">3. Sorumluluk Reddi (Disclaimer)</h2>
          <p className="font-semibold">Üretilen metinler &quot;OLDUĞU GİBİ&quot; (AS-IS) sunulur. Platform sahibi:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>Üretilen metinlerin doğruluğunu, eksiksizliğini, geçerliliğini veya hukuki uygunluğunu garanti etmez.</li>
            <li>Metinlerin kullanımından doğacak hiçbir sonuçtan sorumlu tutulamaz (davalar, cezalar, reddedilmeler, maddi/manevi zararlar vb.).</li>
            <li>Yapay zeka tarafından üretilen içeriklerde hata, eksiklik veya yanıltıcı ifadeler bulunabilir.</li>
            <li>Üretilen metinlerin mahkeme, kurum veya 3. şahıslarca kabul edilmesi garantisi yoktur.</li>
            <li>CV taslaklarının işe alım süreçlerinde sonuç garantisi vermez.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-slate-800">4. Kullanıcı Sorumluluğu</h2>
          <p>Platformu kullanan kişi:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>Oluşturulan metinleri kendi sorumluluğunda kullanır; metinleri mutlaka gözden geçirmeli ve gerektiğinde profesyonel destek almalıdır.</li>
            <li>Önemli hukuki, mali veya idari işlemlerde yetkili bir uzmana danışmadan hareket etmemelidir.</li>
            <li>Yanlış, eksik veya yanıltıcı bilgi kullanımından doğacak tüm sonuçlardan sorumludur.</li>
            <li>CV taslağında verdiği bilgilerin doğru ve güncel olduğundan emin olmalıdır.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-slate-800">5. Garanti Reddi</h2>
          <p>Platform hiçbir açık veya zımni garanti vermez. Belirli amaca uygunluk, kesintisiz çalışma, hukuki geçerlilik veya sonuç garantisi verilmez.</p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-slate-800">6. Yapay Zeka Sınırlamaları</h2>
          <p>Platform 3. taraf yapay zeka servislerini kullanır. Yapay zeka hata yapabilir; mevzuat ve kurallar sürekli değiştiğinden üretilen metinler güncel olmayabilir.</p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-slate-800">7. Kabul Edilemez Kullanım</h2>
          <p>Aşağıdaki durumlarda platform kullanımı yasaktır:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>Yanıltıcı, sahte veya hileli belgeler oluşturmak</li>
            <li>Dolandırıcılık, hukuka aykırı talepler veya yasadışı faaliyetler</li>
            <li>Başkasının adına izinsiz belge hazırlamak</li>
            <li>Suç unsuru taşıyan metinler üretmek</li>
            <li>CV veya diğer belgelerde kasıtlı olarak yanlış bilgi kullanmak</li>
          </ul>
          <p className="font-semibold text-red-700">
            Yasadışı kullanım tespit edilirse yasal işlem başlatılır ve yetkili makamlara bildirimde bulunulur.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-slate-800">8. Abonelik ve Ödeme</h2>
          <p>
            Pro abonelik ve ödeme işlemleri 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği kapsamında yürütülür. Cayma hakkı ve iade koşulları ilgili mevzuata tabidir.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-slate-800">9. Fikri Mülkiyet</h2>
          <p>Site tasarımı, logo ve yazılım YazıAsistan&apos;a aittir. Üretilen metinlerin kullanım hakkı hizmeti kullanan kişiye aittir; ancak metinlerin kullanımından doğan sorumluluk kullanıcıya aittir.</p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-slate-800">10. Veri ve Gizlilik</h2>
          <p>
            Kişisel verileriniz 6698 sayılı KVKK kapsamında işlenir. Detaylar için <Link href="/gizlilik" className="font-semibold text-brand-600 hover:underline">Gizlilik Politikası</Link> ve <Link href="/cerezler" className="font-semibold text-brand-600 hover:underline">Çerez Politikası</Link> sayfalarına bakınız.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-slate-800">11. Uyuşmazlık ve Yetkili Mahkeme</h2>
          <p>Bu koşullardan kaynaklanan uyuşmazlıklarda Türkiye Cumhuriyeti yasaları uygulanır. Yetkili mahkeme ve icra daireleri, platform sahibinin yerleşim yeri mahkemeleridir.</p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-slate-800">12. Kabul ve Onay</h2>
          <p className="font-semibold text-slate-800">
            Bu platformu kullanarak, yukarıdaki tüm koşulları okuduğunuzu, anladığınızı ve kayıtsız şartsız kabul ettiğinizi beyan edersiniz.
          </p>
        </section>
      </div>

      <div className="mt-12 rounded-xl border-2 border-red-200 bg-red-50 p-6">
        <p className="font-bold text-red-900">⚠️ SON UYARI</p>
        <p className="mt-2 text-sm text-red-800">
          Önemli hukuki, mali veya idari konularda mutlaka yetkili bir uzmana (avukat, hukuk bürosu, mali müşavir vb.) danışınız. Bu platform profesyonel danışmanlık yerini TUTMAZ.
        </p>
      </div>

      <p className="mt-8 text-sm text-slate-500">
        Son güncelleme: {new Date().toLocaleDateString("tr-TR")} — Bu metin yasal sorumluluk reddi içerir ve bağlayıcıdır.
      </p>
    </div>
  );
}
