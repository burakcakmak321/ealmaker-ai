import PageHeader from "@/components/PageHeader";
import FiyatlandirmaClient from "@/app/fiyatlandirma/FiyatlandirmaClient";
import { PRICES } from "@/lib/pricing";

export const metadata = {
  title: "Fiyatlandırma | YazıAsistan",
  description: "Premium aylık, yıllık ve tek seferlik paketleri karşılaştırın.",
};

export default function FiyatlandirmaPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <PageHeader
        title="Fiyatlandırma"
        description="İhtiyacınıza uygun paketi seçin. Aylık, yıllık veya tek seferlik kullanım."
        icon="💳"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-card">
          <p className="text-sm font-semibold text-slate-500">Ücretsiz</p>
          <h3 className="mt-2 text-2xl font-bold text-slate-900">Günlük 3 kullanım</h3>
          <p className="mt-2 text-sm text-slate-600">Her gün Türkiye saatiyle gece yarısı yenilenir.</p>
          <ul className="mt-6 space-y-2 text-sm text-slate-600">
            <li>✓ Tüm modüller</li>
            <li>✓ Yazdır / PDF</li>
            <li>✓ Temel destek</li>
          </ul>
        </div>

        <div className="rounded-2xl border-2 border-brand-500 bg-gradient-to-br from-brand-50 to-emerald-50/70 p-8 shadow-[0_10px_40px_-12px_rgba(5,150,105,.35)]">
          <p className="text-sm font-semibold text-brand-700">Önerilen</p>
          <h3 className="mt-2 text-2xl font-bold text-slate-900">Premium Aylık</h3>
          <p className="mt-1 text-3xl font-bold text-brand-700">{PRICES.pro.discounted} ₺<span className="text-base font-medium text-slate-600">/ay</span></p>
          <p className="mt-2 text-sm text-slate-600">Sınırsız kullanım + öncelikli destek.</p>
          <ul className="mt-6 space-y-2 text-sm text-slate-600">
            <li>✓ Sınırsız kullanım</li>
            <li>✓ Tüm modüller</li>
            <li>✓ Öncelikli destek</li>
          </ul>
          <FiyatlandirmaClient plan="pro" />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-card">
          <p className="text-sm font-semibold text-slate-500">Yıllık</p>
          <h3 className="mt-2 text-2xl font-bold text-slate-900">Premium Yıllık</h3>
          <p className="mt-1 text-3xl font-bold text-slate-900">{PRICES.yearly.discounted} ₺<span className="text-base font-medium text-slate-600">/yıl</span></p>
          <p className="mt-2 text-sm text-slate-600">Yıllık kullanım ile daha avantajlı fiyat.</p>
          <ul className="mt-6 space-y-2 text-sm text-slate-600">
            <li>✓ Sınırsız kullanım</li>
            <li>✓ Tüm modüller</li>
            <li>✓ Öncelikli destek</li>
          </ul>
          <a
            href="/odeme/checkout?plan=yearly"
            className="mt-10 block w-full rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 py-4 text-center font-semibold text-white shadow-soft transition hover:from-brand-700 hover:to-brand-600"
          >
            Satın al — {PRICES.yearly.discounted} ₺/yıl
          </a>
        </div>
      </div>

      <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-8 shadow-card">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Tek Seferlik Paket</h3>
            <p className="mt-1 text-sm text-slate-600">Tek seferlik {PRICES.onetime.credits} kullanım hakkı.</p>
          </div>
          <div className="text-2xl font-bold text-slate-900">{PRICES.onetime.discounted} ₺</div>
        </div>
        <FiyatlandirmaClient plan="onetime" />
      </div>
    </div>
  );
}
