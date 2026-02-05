"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthGuard";
import PageHeader from "@/components/PageHeader";

export default function CheckoutPage() {
  const { user, loading: authLoading } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!user) return;
    fetch("/api/checkout", { method: "POST", credentials: "same-origin" })
      .then((r) => r.json())
      .then((data) => {
        if (data.token) setToken(data.token);
        else setError(data.error || "Ödeme başlatılamadı.");
      })
      .catch(() => setError("Bağlantı hatası."));
  }, [user]);

  // PayTR iframe boyutlandırma
  useEffect(() => {
    if (!token) return;
    const script = document.createElement("script");
    script.src = "https://www.paytr.com/js/iframeResizer.min.js";
    script.async = true;
    script.onload = () => {
      if (typeof (window as unknown as { iFrameResize?: (opts: unknown, id: string) => void }).iFrameResize === "function") {
        (window as unknown as { iFrameResize: (opts: unknown, id: string) => void }).iFrameResize({}, "#paytriframe");
      }
    };
    document.body.appendChild(script);
    return () => { script.remove(); };
  }, [token]);

  if (authLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center text-slate-600">
        Yükleniyor…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <PageHeader title="Pro Ödeme" description="Ödeme için giriş yapın." icon="🔒" />
        <Link
          href="/giris?next=/odeme/checkout"
          className="inline-block rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white transition hover:bg-brand-700"
        >
          Giriş yap
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <PageHeader title="Pro Ödeme" description="Ödeme altyapısı kuruluyor." icon="💰" />
        <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-800">
          <p className="font-medium">{error}</p>
          <p className="mt-2 text-sm">
            PayTR veya ödeme sağlayıcı bilgileri Vercel env&apos;e eklenince bu sayfa otomatik çalışacak.
          </p>
          <Link href="/fiyatlandirma" className="mt-4 inline-block text-brand-600 hover:underline">
            ← Fiyatlandırmaya dön
          </Link>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center text-slate-600">
        Ödeme formu hazırlanıyor…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <PageHeader
        title="Pro Ödeme"
        description="Güvenli ödeme ile Pro'ya geçin. 24,50 ₺/ay (YENI2026 ile %50 indirim)."
        icon="💰"
      />
      <p className="mb-4 text-center text-xs text-slate-500">
        Ödemeye devam ederek{" "}
        <Link href="/mesafeli-satis" className="text-brand-600 hover:underline">Mesafeli Satış Sözleşmesi</Link> ve{" "}
        <Link href="/on-bilgilendirme" className="text-brand-600 hover:underline">Ön Bilgilendirme Formu</Link>&apos;nu kabul etmiş olursunuz.
      </p>
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        <iframe
          ref={iframeRef}
          src={"https://www.paytr.com/odeme/guvenli/" + token}
          id="paytriframe"
          frameBorder="0"
          scrolling="no"
          style={{ width: "100%", minHeight: "500px" }}
          title="PayTR Ödeme"
        />
      </div>
      <p className="mt-4 text-center text-sm text-slate-500">
        <Link href="/fiyatlandirma" className="text-brand-600 hover:underline">
          ← İptal et, fiyatlandırmaya dön
        </Link>
      </p>
    </div>
  );
}
