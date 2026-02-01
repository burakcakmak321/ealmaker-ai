import Link from "next/link";

export default function KullanimPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
      <Link href="/" className="mb-8 inline-block text-sm text-slate-600 hover:text-brand-600">
        ← Ana sayfa
      </Link>
      
      {/* Yasal uyarı kutusu */}
      <div className="mb-8 rounded-xl border-2 border-amber-200 bg-amber-50 p-6">
        <div className="flex gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <h2 className="mb-2 font-bold text-amber-900">Önemli Yasal Uyarı</h2>
            <p className="text-sm leading-relaxed text-amber-800">
              Bu platform <strong>yalnızca bilgilendirme ve metin üretme aracıdır</strong>. Üretilen metinler hukuki, mali veya profesyonel tavsiye değildir. Kullanım tamamen sizin sorumluluğunuzdadır.
            </p>
          </div>
        </div>
      </div>

      <h1 className="mb-8 text-3xl font-bold text-slate-900">Kullanım Koşulları ve Sorumluluk Reddi</h1>

      <div className="prose prose-slate max-w-none space-y-6 text-slate-600">
        <section>
          <h2 className="mb-3 text-xl font-semibold text-slate-800">1. Hizmetin Tanımı ve Kapsamı</h2>
          <p>
            DealMaker AI, yapay zeka teknolojisi kullanarak fatura itirazı, pazarlık mesajları ve dilekçe taslakları oluşturan <strong>otomatik metin üretim aracıdır</strong>.
          </p>
          <p className="font-semibold text-amber-700">
            ⚠️ Bu platform: Avukat, mali müşavir, hukuk danışmanı veya profesyonel danışmanlık hizmeti DEĞİLDİR.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-slate-800">2. Sorumluluk Reddi (Disclaimer)</h2>
          <div className="space-y-3">
            <p className="font-semibold">
              Üretilen metinler &quot;OLDUĞU GİBİ&quot; (AS-IS) sunulur. Platform sahibi:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Üretilen metinlerin <strong>doğruluğunu, eksiksizliğini, geçerliliğini veya hukuki uygunluğunu garanti etmez</strong>.</li>
              <li>Metinlerin kullanımından doğacak <strong>hiçbir sonuçtan sorumlu tutulamaz</strong> (davalar, cezalar, reddedilmeler, maddi/manevi zararlar vb.).</li>
              <li>Yapay zeka tarafından üretilen içeriklerde <strong>hata, eksiklik veya yanıltıcı ifadeler</strong> bulunabilir.</li>
              <li>Üretilen metinlerin <strong>mahkeme, kurum veya 3. şahıslarca kabul edilmesi garantisi yoktur</strong>.</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-slate-800">3. Kullanıcı Sorumluluğu</h2>
          <p>
            Platformu kullanan kişi:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Oluşturulan metinleri kendi sorumluluğunda kullanır</strong>.</li>
            <li>Metinleri <strong>mutlaka gözden geçirmeli, kontrol etmeli ve ihtiyaç halinde profesyonel destek almalıdır</strong> (avukat, hukuk bürosu vb.).</li>
            <li>Önemli hukuki, mali veya idari işlemlerde <strong>yetkili bir uzmana danışmadan hareket etmemelidir</strong>.</li>
            <li>Yanlış, eksik veya yanıltıcı bilgi kullanımından <strong>doğacak tüm sonuçlardan sorumludur</strong>.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-slate-800">4. Garanti Reddi</h2>
          <p>
            Platform, <strong>hiçbir açık veya zımni garanti vermez</strong>. Şunlar dahil:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Belirli bir amaca uygunluk garantisi</li>
            <li>Kesintisiz veya hatasız çalışma garantisi</li>
            <li>Hukuki geçerlilik garantisi</li>
            <li>Sonuç garantisi (itirazın kabulü, pazarlığın başarılı olması vb.)</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-slate-800">5. Yapay Zeka Sınırlamaları</h2>
          <p>
            Bu platform OpenAI gibi 3. taraf yapay zeka servislerini kullanır:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Yapay zeka hata yapabilir, güncel olmayan veya yanlış bilgi üretebilir.</li>
            <li>Her vaka özgün olduğundan, üretilen metin <strong>sizin durumunuza tam uymayabilir</strong>.</li>
            <li>Mevzuat, içtihat ve resmi yazışma kuralları sürekli değişir; metinler <strong>güncel olmayabilir</strong>.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-slate-800">6. Kabul Edilemez Kullanım</h2>
          <p>
            Aşağıdaki durumlarda platform kullanımı <strong>yasaktır</strong>:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Yanıltıcı, sahte veya hileli belgeler oluşturmak</li>
            <li>Dolandırıcılık, hukuka aykırı talepler veya yasadışı faaliyetler</li>
            <li>Başkasının adına izinsiz belge hazırlamak</li>
            <li>Suç unsuru taşıyan metinler üretmek</li>
          </ul>
          <p className="font-semibold text-red-700">
            ⚠️ Yasadışı kullanım tespit edilirse, kullanıcı hakkında yasal işlem başlatılır ve yetkili makamlara bildirimde bulunulur.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-slate-800">7. Hizmet Değişiklikleri ve Kesintiler</h2>
          <p>
            Platform sahibi, önceden haber vermeksizin:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Hizmeti durdurabilir, değiştirebilir veya sonlandırabilir</li>
            <li>İçerik, fiyat veya özellikleri güncelleyebilir</li>
            <li>Kullanıcı erişimini kısıtlayabilir veya iptal edebilir</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-slate-800">8. Fikri Mülkiyet</h2>
          <p>
            Site tasarımı, logo, yazılım ve içerik DealMaker AI&apos;a aittir. <strong>Üretilen metinlerin kullanım hakkı, hizmeti kullanan kişiye aittir</strong> — ancak metinlerin sonuçlarından sorumluluk da kullanıcıya aittir.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-slate-800">9. Veri ve Gizlilik</h2>
          <p>
            Girilen bilgiler (kurum adı, konu, detay vb.) yalnızca metin üretmek için kullanılır. Detaylar için <Link href="/gizlilik" className="text-brand-600 hover:underline font-semibold">Gizlilik Politikası</Link> sayfasına bakınız.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-slate-800">10. Uyuşmazlık ve Yetkili Mahkeme</h2>
          <p>
            Bu koşullardan kaynaklanan uyuşmazlıklarda <strong>Türkiye Cumhuriyeti yasaları</strong> uygulanır. Yetkili mahkeme ve icra daireleri, platform sahibinin yerleşim yeri mahkemeleridir.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-slate-800">11. Kabul ve Onay</h2>
          <p className="font-semibold text-slate-800">
            Bu platformu kullanarak, yukarıdaki tüm koşulları okuduğunuzu, anladığınızı ve <strong>kayıtsız şartsız kabul ettiğinizi</strong> beyan edersiniz.
          </p>
        </section>
      </div>

      <div className="mt-12 rounded-xl border-2 border-red-200 bg-red-50 p-6">
        <p className="font-bold text-red-900">⚠️ SON UYARI</p>
        <p className="mt-2 text-sm text-red-800">
          Önemli hukuki, mali veya idari konularda <strong>mutlaka yetkili bir uzmana (avukat, hukuk bürosu, mali müşavir vb.) danışınız</strong>. Bu platform profesyonel danışmanlık yerini TUTMAZ.
        </p>
      </div>

      <p className="mt-8 text-sm text-slate-500">
        Son güncelleme: {new Date().toLocaleDateString("tr-TR")} — Bu metin yasal sorumluluk reddi içerir ve bağlayıcıdır.
      </p>
    </div>
  );
}
