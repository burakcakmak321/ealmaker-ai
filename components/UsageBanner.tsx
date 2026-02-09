"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthGuard";

export default function UsageBanner() {
  const { user, loading: authLoading } = useAuth();
  const [remaining, setRemaining] = useState<number | null>(null);
  const [over, setOver] = useState(false);
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    if (!user) {
      setRemaining(null);
      setOver(false);
      setIsPro(false);
      return;
    }
    fetch("/api/usage")
      .then((res) => res.json())
      .then((data) => {
        if (data.isPro) {
          setIsPro(true);
          setRemaining(null);
          setOver(false);
        } else {
          setIsPro(false);
          setRemaining(data.remaining ?? 0);
          setOver((data.count ?? 0) >= (data.limit ?? 2));
        }
      })
      .catch(() => {
        setRemaining(0);
        setOver(false);
      });
  }, [user]);

  const refresh = () => {
    if (!user) return;
    fetch("/api/usage")
      .then((res) => res.json())
      .then((data) => {
        if (data.isPro) {
          setIsPro(true);
          setRemaining(null);
          setOver(false);
        } else {
          setIsPro(false);
          setRemaining(data.remaining ?? 0);
          setOver((data.count ?? 0) >= (data.limit ?? 2));
        }
      });
  };

  if (authLoading) return null;

  if (!user) {
    return (
      <div
        className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200/80 bg-white px-4 py-2.5 text-sm text-slate-600 shadow-card"
        role="status"
      >
        <span>
          <span className="font-medium text-slate-700">2 ücretsiz kullanım</span> için{" "}
          <Link href="/giris" className="font-semibold text-brand-600 hover:underline">
            giriş yapın
          </Link>{" "}
          veya{" "}
          <Link href="/giris" className="font-semibold text-brand-600 hover:underline">
            kayıt olun
          </Link>
          .
        </span>
      </div>
    );
  }

  if (isPro) {
    return (
      <div
        className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-brand-200/80 bg-brand-50/50 px-4 py-2.5 text-sm text-slate-700 shadow-card"
        role="status"
      >
        <span>
          <span className="font-semibold text-brand-700">Pro</span> — Sınırsız kullanım
        </span>
      </div>
    );
  }
  if (remaining === null) return null;

  return (
    <div
      className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200/80 bg-white px-4 py-2.5 text-sm text-slate-600 shadow-card"
      role="status"
      aria-live="polite"
    >
      {over ? (
        <span>
          Kullanım hakkınız doldu. Tek seferlik paket veya{" "}
          <Link href="/fiyatlandirma" className="font-semibold text-brand-600 hover:underline">
            Pro
          </Link>
          &apos;ya geçin.
        </span>
      ) : (
        <span>
          <span className="font-medium text-slate-700">Kalan kullanım:</span>{" "}
          <strong className="text-brand-600">{remaining}</strong>
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
