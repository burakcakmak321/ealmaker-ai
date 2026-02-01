"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getRemainingFree, isOverFreeLimit, FREE_LIMIT } from "@/lib/usage";

export default function UsageBanner() {
  const [remaining, setRemaining] = useState<number | null>(null);
  const [over, setOver] = useState(false);

  useEffect(() => {
    const update = () => {
      setRemaining(getRemainingFree());
      setOver(isOverFreeLimit());
    };
    update();
    window.addEventListener("dealmaker-usage-update", update);
    return () => window.removeEventListener("dealmaker-usage-update", update);
  }, []);

  const refresh = () => {
    setRemaining(getRemainingFree());
    setOver(isOverFreeLimit());
  };

  if (remaining === null) return null;

  return (
    <div
      className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200/80 bg-white px-4 py-2.5 text-sm text-slate-600 shadow-card"
      role="status"
      aria-live="polite"
    >
      {over ? (
        <span>
          Ücretsiz {FREE_LIMIT} kullanım doldu. Sınırsız kullanım için{" "}
          <Link href="/fiyatlandirma" className="font-semibold text-brand-600 hover:underline">
            Pro
          </Link>
          ’ya geçin.
        </span>
      ) : (
        <span>
          <span className="font-medium text-slate-700">Ücretsiz kullanım:</span>{" "}
          <strong className="text-brand-600">{remaining}</strong> / {FREE_LIMIT} kaldı
        </span>
      )}
      <button
        type="button"
        onClick={refresh}
        className="rounded-lg px-2 py-1 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
      >
        Güncelle
      </button>
    </div>
  );
}
