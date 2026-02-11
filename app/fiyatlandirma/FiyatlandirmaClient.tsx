"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthGuard";
import { PRICES } from "@/lib/pricing";

type Plan = "pro" | "onetime";

export default function FiyatlandirmaClient({ plan = "pro" }: { plan?: Plan }) {
  const { user, loading } = useAuth();
  const isPro = plan === "pro";

  // Premium şu an yakında — kullanıcıları bekletiyoruz
  if (isPro) {
    return (
      <div className="mt-10 space-y-3">
        <div className="rounded-xl border-2 border-dashed border-brand-300 bg-brand-50/50 px-4 py-4 text-center">
          <p className="text-sm font-semibold text-brand-700">🚀 Çok yakında</p>
          <p className="mt-1 text-xs text-slate-600">
            Premium abonelik üzerinde çalışıyoruz. Haberdar olmak için takipte kalın.
          </p>
        </div>
        <Link
          href="/premium-yakinda"
          className="block w-full rounded-xl border-2 border-brand-400 bg-white py-3.5 text-center text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
        >
          Detayları gör
        </Link>
      </div>
    );
  }

  const label = `Satın al — ${PRICES.onetime.discounted} ₺ (${PRICES.onetime.credits} kullanım)`;

  if (loading) {
    return (
      <div className="mt-10 block w-full rounded-xl bg-slate-200 py-4 text-center font-semibold text-slate-500">
        Yükleniyor…
      </div>
    );
  }

  if (!user) {
    return (
      <Link
        href={`/giris?next=/odeme/checkout?plan=${plan}`}
        className="mt-10 block w-full rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 py-4 text-center font-semibold text-white shadow-soft transition hover:from-brand-700 hover:to-brand-600"
      >
        {label} — Giriş yap
      </Link>
    );
  }

  return (
    <Link
      href={`/odeme/checkout?plan=${plan}`}
      className="mt-10 block w-full rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 py-4 text-center font-semibold text-white shadow-soft transition hover:from-brand-700 hover:to-brand-600"
    >
      {label}
    </Link>
  );
}
