"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthGuard";

export default function FiyatlandirmaClient() {
  const { user, loading } = useAuth();

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
        href="/giris?next=/fiyatlandirma"
        className="mt-10 block w-full rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 py-4 text-center font-semibold text-white shadow-soft transition hover:from-brand-700 hover:to-brand-600"
      >
        Pro&apos;ya geç — Giriş yap
      </Link>
    );
  }

  return (
    <Link
      href="/odeme/checkout"
      className="mt-10 block w-full rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 py-4 text-center font-semibold text-white shadow-soft transition hover:from-brand-700 hover:to-brand-600"
    >
      Pro&apos;ya geç — 24,50 ₺/ay (YENI2026)
    </Link>
  );
}
