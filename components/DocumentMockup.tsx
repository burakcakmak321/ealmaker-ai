/** Hero bölümünde gösterilecek örnek belge mockup — fatura itirazı örneği */

export default function DocumentMockup() {
  return (
    <div className="relative">
      <div className="absolute -inset-4 rounded-2xl bg-gradient-to-br from-brand-200/30 to-emerald-300/20 blur-2xl" aria-hidden />
      <div className="relative overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-[0_25px_50px_-12px_rgba(0,0,0,.15)] ring-1 ring-slate-900/5">
        <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-2.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Örnek çıktı</span>
        </div>
        <div className="aspect-[210/297] max-h-[380px] overflow-hidden p-6 sm:p-8">
          <div className="h-full space-y-4 font-serif text-slate-700">
            <p className="text-sm leading-relaxed">
              <strong>Konu:</strong> Fatura İtirazı
            </p>
            <p className="text-sm leading-relaxed">
              Sayın Yetkili,
            </p>
            <p className="text-sm leading-relaxed">
              Müşteri numaram [••••] olan, [Kurum] nezdindeki aboneliğime ait [tarih] tarihli faturanın tutarında, hizmet kullanımıma kıyasla belirgin bir artış tespit ettim. 6502 sayılı Tüketicinin Korunması Hakkında Kanun kapsamında bilgilendirme ve itiraz haklarımı kullanarak bu faturanın yeniden değerlendirilmesini talep ediyorum.
            </p>
            <p className="text-sm leading-relaxed">
              Lütfen faturanızı inceleyerek gerekli düzeltmelerin yapılması ve bana bilgi verilmesi hususunda gereğini rica ederim.
            </p>
            <p className="pt-4 text-sm">
              Saygılarımla,
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
