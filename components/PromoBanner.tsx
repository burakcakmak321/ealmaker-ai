import Link from "next/link";

export default function PromoBanner() {
  return (
    <div className="no-print border-b border-brand-200/80 bg-gradient-to-r from-brand-600 to-brand-500 py-2.5 text-center text-sm font-medium text-white">
      <span className="mr-2">🎉</span>
      Yeni yıl kampanyası: Pro üyelikte <strong>%50 indirim</strong> — Kod: <strong>YENI2026</strong>
      <Link
        href="/fiyatlandirma"
        className="ml-3 inline-flex items-center rounded-lg bg-white/20 px-2.5 py-1 font-semibold text-white transition hover:bg-white/30"
      >
        Fiyatları gör
      </Link>
    </div>
  );
}
