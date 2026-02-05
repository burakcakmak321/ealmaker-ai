/** Feragatname bileşeni - tüm modül sayfalarında yasal uyarı gösterir */

export default function Disclaimer() {
  return (
    <div className="mb-6 rounded-xl border-2 border-amber-200 bg-amber-50 p-4">
      <div className="flex gap-3">
        <span className="text-xl">⚠️</span>
        <div className="flex-1 text-sm">
          <p className="font-semibold text-amber-900">Önemli Yasal Uyarı</p>
          <p className="mt-1 text-amber-800">
            Bu platform <strong>bilgilendirme ve metin taslağı üretim aracıdır</strong>. Üretilen metinler (dilekçe taslağı, CV taslağı, fatura itirazı, pazarlık mesajı dahil) <strong>hukuki, mali veya profesyonel tavsiye değildir</strong>. 
            Avukatlık Kanunu uyarınca avukatlık hizmeti sunulmamaktadır. Önemli işlemlerde <strong>mutlaka yetkili uzmana (avukat, mali müşavir vb.) danışınız</strong>. 
            Kullanım sorumluluğu size aittir.{" "}
            <a href="/kullanim" className="font-medium underline hover:text-amber-900">Detaylar</a>
          </p>
        </div>
      </div>
    </div>
  );
}
