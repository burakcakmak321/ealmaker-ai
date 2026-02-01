import Link from "next/link";
import PageHeader from "@/components/PageHeader";

export default function FiyatlandirmaPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-20">
      <PageHeader
        title="Fiyatlandırma"
        description="İlk 2 kullanım ücretsiz. Sonrası için Pro ile sınırsız kullanın. Ödeme entegrasyonu yakında."
        icon="💰"
      />

      <div className="grid gap-8 sm:grid-cols-2">
        {/* Ücretsiz */}
        <div className="rounded-2xl border-2 border-slate-200/80 bg-white p-8 shadow-card transition hover:border-slate-300 hover:shadow-soft sm:p-10">
          <h2 className="text-xl font-bold text-slate-900">Ücretsiz</h2>
          <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">
            0 ₺
            <span className="text-base font-normal text-slate-500"> / her zaman</span>
          </p>
          <ul className="mt-8 space-y-4 text-slate-600">
            <li className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-600">✓</span>
              2 dilekçe / mesaj ücretsiz
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-600">✓</span>
              Tüm modüller (Fatura, Pazarlık, Dilekçe)
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-600">✓</span>
              Kopyala, yazdır
            </li>
          </ul>
          <Link
            href="/fatura"
            className="mt-10 block w-full rounded-xl border-2 border-slate-200 py-4 text-center font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            Ücretsiz dene
          </Link>
        </div>

        {/* Pro */}
        <div className="relative rounded-2xl border-2 border-brand-500 bg-white p-8 shadow-soft sm:p-10">
          <div className="absolute -top-3.5 left-6 rounded-full bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-1.5 text-xs font-bold text-white shadow-soft">
            Önerilen
          </div>
          <h2 className="text-xl font-bold text-slate-900">Pro</h2>
          <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">
            Yakında
            <span className="text-base font-normal text-slate-500"> / aylık</span>
          </p>
          <ul className="mt-8 space-y-4 text-slate-600">
            <li className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-600">✓</span>
              Sınırsız dilekçe ve mesaj
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-600">✓</span>
              PDF indirme
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-600">✓</span>
              Öncelikli destek
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-600">✓</span>
              Yeni modüller öncelikli
            </li>
          </ul>
          <button
            type="button"
            disabled
            className="mt-10 block w-full rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 py-4 font-semibold text-white shadow-soft opacity-90"
          >
            Yakında — Ödeme eklenecek
          </button>
        </div>
      </div>

      <p className="mt-12 text-center text-sm text-slate-500">
        Kurumsal veya toplu kullanım için{" "}
        <Link href="/iletisim" className="font-medium text-brand-600 hover:underline">
          iletişime geçin
        </Link>
        .
      </p>
    </div>
  );
}
