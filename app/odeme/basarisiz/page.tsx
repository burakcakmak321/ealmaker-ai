import Link from "next/link";
import PageHeader from "@/components/PageHeader";

export default function OdemeBasarisizPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <PageHeader
        title="Ödeme Başarısız"
        description="Ödeme işlemi tamamlanamadı. Lütfen tekrar deneyin."
        icon="❌"
      />
      <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-8 text-slate-700">
        <p>İşlem başarısız oldu veya iptal edildi.</p>
      </div>
      <Link
        href="/fiyatlandirma"
        className="mt-8 inline-block rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white transition hover:bg-brand-700"
      >
        Fiyatlandırmaya dön
      </Link>
    </div>
  );
}