import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import FiyatlandirmaClient from "./FiyatlandirmaClient";
import { PRICES } from "@/lib/pricing";

export default function FiyatlandirmaPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-20">
      <PageHeader
        title="Fiyatlandırma"
        description="Günlük 3 ücretsiz kullanım. Tek seferlik paket veya Premium ile devam edin. Güvenli ödeme ile anında aktif."
        icon="💰"
      />

      <div className="grid gap-8 sm:grid-cols-3">
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
              Günlük 3 metin taslağı ücretsiz
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-600">✓</span>
              Tüm modüller
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

        {/* Tek Seferlik */}
        <div className="rounded-2xl border-2 border-slate-200/80 bg-white p-8 shadow-card transition hover:border-brand-200 hover:shadow-soft sm:p-10">
          <h2 className="text-xl font-bold text-slate-900">Tek Seferlik</h2>
          <p className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl text-slate-400 line-through">{PRICES.onetime.normal} ₺</span>
            <span className="text-3xl font-extrabold tracking-tight text-slate-900">{PRICES.onetime.discounted} ₺</span>
            <span className="rounded bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700">YENI2026</span>
          </p>
          <p className="mt-1 text-sm text-slate-500">{PRICES.onetime.credits} ek kullanım hakkı</p>
          <ul className="mt-8 space-y-4 text-slate-600">
            <li className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-600">✓</span>
              {PRICES.onetime.credits} metin taslağı hakkı
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-600">✓</span>
              Tüm modüller
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-600">✓</span>
              Tek seferlik, abonelik yok
            </li>
          </ul>
          <FiyatlandirmaClient plan="onetime" />
        </div>

        {/* Premium */}
        <div className="relative rounded-2xl border-2 border-brand-500 bg-white p-8 shadow-soft sm:p-10">
          <div className="absolute -top-3.5 left-6 rounded-full bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-1.5 text-xs font-bold text-white shadow-soft">
            Yakında
          </div>
          <h2 className="text-xl font-bold text-slate-900">Premium</h2>
          <p className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl text-slate-400 line-through">{PRICES.pro.normal} ₺</span>
            <span className="text-3xl font-extrabold tracking-tight text-slate-900">{PRICES.pro.discounted} ₺</span>
            <span className="text-base text-slate-500">/ ay</span>
            <span className="rounded bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700">YENI2026</span>
          </p>
          <p className="mt-1 text-sm text-slate-500">Sınırsız kullanım</p>
          <ul className="mt-8 space-y-4 text-slate-600">
            <li className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-600">✓</span>
              Sınırsız metin taslağı
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-600">✓</span>
              PDF indirme
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-600">✓</span>
              Öncelikli destek
            </li>
          </ul>
          <FiyatlandirmaClient plan="pro" />
          <p className="mt-4 text-center text-xs text-slate-500">
            <Link href="/mesafeli-satis" className="text-brand-600 hover:underline">Mesafeli Satış</Link>
            {" · "}
            <Link href="/on-bilgilendirme" className="text-brand-600 hover:underline">Ön Bilgilendirme</Link>
          </p>
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
