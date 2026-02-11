import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { PRICES } from "@/lib/pricing";

export default function OdemeBasariliPage({
  searchParams,
}: {
  searchParams?: { plan?: string };
}) {
  const plan = searchParams?.plan === "onetime" ? "onetime" : "pro";
  const isPro = plan === "pro";

  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <PageHeader
        title="Ödeme Başarılı"
        description={isPro ? "Premium üyeliğiniz aktif." : `${PRICES.onetime.credits} kullanım hakkınız eklendi.`}
        icon="✅"
      />
      <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 p-8 text-green-800">
        <p className="font-semibold">Teşekkürler. Ödemeniz alındı.</p>
        <p className="mt-2 text-sm">
          {isPro
            ? "Fatura, pazarlık, resmi yazı taslağı ve CV modüllerinde sınırsız kullanım yapabilirsiniz."
            : `${PRICES.onetime.credits} ek kullanım hakkınız hesabınıza tanımlandı. Modülleri kullanmaya devam edebilirsiniz.`}
        </p>
      </div>
      <Link
        href="/fatura"
        className="mt-8 inline-block rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white transition hover:bg-brand-700"
      >
        Modüllere git
      </Link>
    </div>
  );
}
