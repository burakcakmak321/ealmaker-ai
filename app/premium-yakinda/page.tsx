import Link from "next/link";
import PageHeader from "@/components/PageHeader";

export const metadata = {
  title: "Premium Yakında | YazıAsistan",
  description: "Premium üyelik çok yakında. Günlük 3 kullanım hakkınız her gün yenilenir.",
};

export default function PremiumYakindaPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 text-center">
      <PageHeader
        title="Premium — Çok Yakında"
        description="Çalışmalar devam ediyor."
        icon="🚀"
      />
      <div className="rounded-2xl border border-brand-200/80 bg-brand-50/50 px-6 py-10 text-slate-700">
        <p className="text-lg font-medium">
          Premium üyelik üzerinde çalışıyoruz. Yakında hizmetinizde olacak.
        </p>
        <p className="mt-4 text-slate-600">
          Bu süreçte günlük <strong>3 ücretsiz kullanım hakkınız</strong> her gün gece yarısı (Türkiye saati) yenilenir.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white transition hover:bg-brand-700"
        >
          Ana sayfaya dön
        </Link>
      </div>
    </div>
  );
}
