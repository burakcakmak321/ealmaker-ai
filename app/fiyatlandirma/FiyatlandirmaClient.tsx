"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthGuard";
import { PRICES } from "@/lib/pricing";

type Plan = "pro" | "onetime";

export default function FiyatlandirmaClient({ plan = "pro" }: { plan?: Plan }) {
  const { user, loading } = useAuth();

  const label = plan === "pro"
    ? `Satın al — ${PRICES.pro.discounted} ₺/ay`
    : `Satın al — ${PRICES.onetime.discounted} ₺ (${PRICES.onetime.credits} kullanım)`;

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
