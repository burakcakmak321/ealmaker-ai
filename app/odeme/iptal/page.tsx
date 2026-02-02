import Link from "next/link";
import PageHeader from "@/components/PageHeader";

export default function OdemeIptalPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <PageHeader
        title="Ödeme İptal"
        description="Ödeme işlemi iptal edildi veya başarısız oldu."
        icon="❌"
      />
      <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-8 text-slate-700">
        <p>İstediğiniz zaman tekrar deneyebilirsiniz.</p>
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
