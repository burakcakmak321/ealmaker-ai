import Link from "next/link";

export default function PromoBanner() {
  return (
    <div className="no-print border-b border-brand-300/50 bg-gradient-to-r from-brand-600 via-brand-500 to-emerald-500 py-3 text-center text-sm font-medium text-white shadow-[0_2px_8px_-2px_rgba(5,150,105,.3)]">
      <span className="mr-2">🎉</span>
      Kampanya: Premium 99 ₺/ay, Tek seferlik 29 ₺ — Kod: <strong>YENI2026</strong>
      <Link
        href="/fiyatlandirma"
        className="ml-3 inline-flex items-center rounded-lg bg-white/20 px-3 py-1.5 font-semibold text-white transition hover:bg-white/30"
      >
        Fiyatları gör
      </Link>
    </div>
  );
}
