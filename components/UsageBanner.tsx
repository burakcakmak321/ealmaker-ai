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
          setOver((data.count ?? 0) >= (data.limit ?? 3));
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
          setOver((data.count ?? 0) >= (data.limit ?? 3));
        }
      });
  };

  if (authLoading) return null;

  if (!user) {
return (
    <div
        className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200/80 bg-white px-4 py-3 text-sm text-slate-600 shadow-[0_1px_3px_rgba(0,0,0,.06)]"
        role="status"
      >
        <span>
          <span className="font-medium text-slate-700">Günlük 3 ücretsiz kullanım</span> için{" "}
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
        className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-brand-200/80 bg-brand-50/80 px-4 py-3 text-sm text-slate-700 shadow-[0_1px_3px_rgba(5,150,105,.08)]"
        role="status"
      >
        <span>
          <span className="font-semibold text-brand-700">Premium</span> — Sınırsız kullanım
        </span>
      </div>
    );
  }
  if (remaining === null) return null;

  return (
    <div
      className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200/80 bg-white px-4 py-3 text-sm text-slate-600 shadow-[0_1px_3px_rgba(0,0,0,.06)]"
      role="status"
      aria-live="polite"
    >
      {over ? (
        <span>
          Kullanım hakkınız doldu. Günlük 3 hakkınız her gün yenilenir.{" "}
          <Link href="/premium-yakinda" className="font-semibold text-brand-600 hover:underline">
            Premium
          </Link>
          &apos;a geçin (yakında).
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
