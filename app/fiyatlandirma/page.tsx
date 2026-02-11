import Link from "next/link";
import PageHeader from "@/components/PageHeader";

export const metadata = {
  title: "Fiyatlandırma | YazıAsistan",
  description: "Premium üyelik yakında. Günlük 3 kullanım hakkınız her gün yenilenir.",
};

export default function FiyatlandirmaPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 text-center">
      <PageHeader
        title="Premium — Çok Yakında"
        description="Çalışmalar devam ediyor."
        icon="🚀"
      />
      <div className="rounded-2xl border border-brand-200/80 bg-gradient-to-br from-brand-50 to-emerald-50/80 px-6 py-12 text-slate-700 shadow-[0_4px_24px_-4px_rgba(5,150,105,.12)]">
        <p className="text-lg font-medium">
          Premium üyelik üzerinde çalışıyoruz. Yakında hizmetinizde olacak.
        </p>
        <p className="mt-4 text-slate-600">
          Bu süreçte günlük <strong>3 ücretsiz kullanım hakkınız</strong> her gün gece yarısı (Türkiye saati) yenilenir.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-xl bg-brand-600 px-8 py-4 font-semibold text-white shadow-[0_4px_14px_-2px_rgba(5,150,105,.4)] transition hover:bg-brand-700"
        >
          Ana sayfaya dön
        </Link>
      </div>
    </div>
  );
}
