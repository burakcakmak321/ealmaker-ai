/** Feragatname bileşeni - tüm modül sayfalarında yasal uyarı gösterir */

export default function Disclaimer() {
  return (
    <div className="mb-6 rounded-xl border-2 border-amber-200 bg-amber-50 p-4">
      <div className="flex gap-3">
        <span className="text-xl">⚠️</span>
        <div className="flex-1 text-sm">
          <p className="font-semibold text-amber-900">Önemli Uyarı</p>
          <p className="mt-1 text-amber-800">
            Bu platform <strong>bilgilendirme aracıdır</strong>. Üretilen metinler hukuki tavsiye değildir. 
            Önemli işlemlerde <strong>mutlaka uzmana danışınız</strong>. 
            Kullanım sorumluluğu size aittir.{" "}
            <a href="/kullanim" className="underline hover:text-amber-900">Detaylar</a>
          </p>
        </div>
      </div>
    </div>
  );
}
