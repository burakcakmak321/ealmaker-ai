import Link from "next/link";
import PageHeader from "@/components/PageHeader";

export const metadata = {
  title: "Premium Paketler | YazıAsistan",
  description: "Premium paketler ve fiyatlandırma hakkında bilgi alın.",
};

export default function PremiumYakindaPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 text-center">
      <PageHeader
        title="Premium Paketler"
        description="Aylık, yıllık ve tek seferlik paketleri fiyatlandırma sayfasından inceleyin."
        icon="💳"
      />
      <div className="rounded-2xl border border-brand-200/80 bg-gradient-to-br from-brand-50 to-emerald-50/80 px-6 py-12 text-slate-700 shadow-[0_4px_24px_-4px_rgba(5,150,105,.12)]">
        <p className="text-lg font-medium">
          Premium paketler aktif. Size uygun paketi seçip hemen başlayabilirsiniz.
        </p>
        <p className="mt-4 text-slate-600">
          Aylık, yıllık ve tek seferlik seçenekler için fiyatlandırma sayfasına gidin.
        </p>
        <Link
          href="/fiyatlandirma"
          className="mt-8 inline-flex rounded-xl bg-brand-600 px-8 py-4 font-semibold text-white shadow-[0_4px_14px_-2px_rgba(5,150,105,.4)] transition hover:bg-brand-700"
        >
          Fiyatlandırmayı incele
        </Link>
      </div>
    </div>
  );
}
