"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/components/AuthGuard";
import PageHeader from "@/components/PageHeader";
import { PRICES } from "@/lib/pricing";

function CheckoutContent() {
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const plan = (searchParams.get("plan") === "onetime" ? "onetime" : "pro") as "pro" | "onetime";
  const isPro = plan === "pro";
  const amount = isPro ? PRICES.pro.discounted : PRICES.onetime.discounted;
  const desc = isPro ? `${amount} ₺/ay (YENI2026)` : `${amount} ₺ — ${PRICES.onetime.credits} kullanım (YENI2026)`;

  const [ucdHtml, setUcdHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [checked1, setChecked1] = useState(false);
  const [checked2, setChecked2] = useState(false);
  const [cardForm, setCardForm] = useState(false);
  const [card, setCard] = useState({ kkSahibi: "", kkNo: "", kkSkAy: "", kkSkYil: "", kkCvc: "", kkSahibiGsm: "" });
  const [submitting, setSubmitting] = useState(false);
  const iframe3DRef = useRef<HTMLIFrameElement>(null);

  const canProceed = checked1 && checked2;

  function handleProceed() {
    if (!canProceed || !user) return;
    setAccepted(true);
    setCardForm(true);
  }

  function handleParamPosSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || submitting) return;
    setSubmitting(true);
    setError(null);
    fetch("/api/checkout/parampos", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        plan,
        kkSahibi: card.kkSahibi.trim(),
        kkNo: card.kkNo.replace(/\s/g, ""),
        kkSkAy: card.kkSkAy.replace(/\D/g, "").padStart(2, "0").slice(0, 2),
        kkSkYil: card.kkSkYil.replace(/\D/g, "").slice(-4),
        kkCvc: card.kkCvc.replace(/\D/g, "").slice(0, 4),
        kkSahibiGsm: card.kkSahibiGsm.replace(/\D/g, "").replace(/^0/, "").slice(-10),
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.ucdHtml) {
          setUcdHtml(data.ucdHtml);
        } else {
          setError(data.error || "Ödeme başlatılamadı.");
          setSubmitting(false);
        }
      })
      .catch(() => {
        setError("Bağlantı hatası.");
        setSubmitting(false);
      });
  }

  useEffect(() => {
    if (!ucdHtml || !iframe3DRef.current) return;
    const doc = iframe3DRef.current.contentDocument;
    if (doc) {
      doc.open();
      doc.write(ucdHtml);
      doc.close();
    }
  }, [ucdHtml]);

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
        <PageHeader title="Ödeme" description="Ödeme için giriş yapın." icon="🔒" />
        <Link
          href={`/giris?next=/odeme/checkout?plan=${plan}`}
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
        <PageHeader title="Ödeme" description="" icon="💰" />
        <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-800">
          <p className="font-medium">{error}</p>
          <Link href="/fiyatlandirma" className="mt-4 inline-block text-brand-600 hover:underline">
            ← Fiyatlandırmaya dön
          </Link>
        </div>
      </div>
    );
  }

  if (ucdHtml) {
    return (
      <div className="fixed inset-0 z-50 bg-white">
        <iframe
          ref={iframe3DRef}
          title="3D Secure"
          className="h-full w-full border-0"
          sandbox="allow-forms allow-scripts allow-same-origin allow-top-navigation"
        />
      </div>
    );
  }

  if (accepted && cardForm) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <PageHeader
          title={isPro ? "Pro Ödeme" : "Tek Seferlik Ödeme"}
          description={`Güvenli 3D ödeme (Param) — ${desc}`}
          icon="💰"
        />
        <form onSubmit={handleParamPosSubmit} className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
          <p className="mb-4 text-sm font-medium text-slate-700">Kart bilgilerinizi girin (3D Secure ile güvende)</p>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">Kart üzerindeki ad soyad</label>
              <input
                type="text"
                required
                maxLength={100}
                value={card.kkSahibi}
                onChange={(e) => setCard((c) => ({ ...c, kkSahibi: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                placeholder="AD SOYAD"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">Kart numarası</label>
              <input
                type="tel"
                inputMode="numeric"
                required
                maxLength={19}
                value={card.kkNo}
                onChange={(e) => setCard((c) => ({ ...c, kkNo: e.target.value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim() }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-slate-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                placeholder="0000 0000 0000 0000"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600">Son kullanma (Ay)</label>
                <input
                  type="tel"
                  inputMode="numeric"
                  required
                  maxLength={2}
                  value={card.kkSkAy}
                  onChange={(e) => setCard((c) => ({ ...c, kkSkAy: e.target.value.replace(/\D/g, "").slice(0, 2) }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  placeholder="04"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600">Yıl</label>
                <input
                  type="tel"
                  inputMode="numeric"
                  required
                  maxLength={4}
                  value={card.kkSkYil}
                  onChange={(e) => setCard((c) => ({ ...c, kkSkYil: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  placeholder="28"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600">CVC</label>
                <input
                  type="tel"
                  inputMode="numeric"
                  required
                  maxLength={4}
                  value={card.kkCvc}
                  onChange={(e) => setCard((c) => ({ ...c, kkCvc: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  placeholder="123"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600">Cep telefonu (10 hane)</label>
                <input
                  type="tel"
                  inputMode="numeric"
                  required
                  maxLength={11}
                  value={card.kkSahibiGsm}
                  onChange={(e) => setCard((c) => ({ ...c, kkSahibiGsm: e.target.value.replace(/\D/g, "").replace(/^0/, "") }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  placeholder="5XX XXX XX XX"
                />
              </div>
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">Kart bilgileriniz şifreli iletilir, saklanmaz. Param 3D Secure ile banka doğrulaması yapılacaktır.</p>
          <button
            type="submit"
            disabled={submitting}
            className="mt-6 w-full rounded-xl bg-brand-600 py-3.5 font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
          >
            {submitting ? "Yönlendiriliyor…" : `${amount} ₺ öde — 3D Secure`}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-500">
          <Link href="/fiyatlandirma" className="text-brand-600 hover:underline">← İptal et, fiyatlandırmaya dön</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <PageHeader
        title={isPro ? "Pro Ödeme" : "Tek Seferlik Ödeme"}
        description={`Güvenli ödeme (Param) — ${desc}`}
        icon="💰"
      />
      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-card">
        <p className="mb-4 text-sm font-medium text-slate-700">Ödemeye devam etmeden önce lütfen aşağıdakileri okuyup onaylayın:</p>
        <div className="space-y-4">
          <label className="flex cursor-pointer items-start gap-3">
            <input type="checkbox" checked={checked1} onChange={(e) => setChecked1(e.target.checked)} className="mt-1 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
            <span className="text-sm text-slate-600">
              <Link href="/mesafeli-satis" className="font-medium text-brand-600 hover:underline">Mesafeli Satış Sözleşmesi</Link> ve{" "}
              <Link href="/on-bilgilendirme" className="font-medium text-brand-600 hover:underline">Ön Bilgilendirme Formu</Link>nu okudum, kabul ediyorum.
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-3">
            <input type="checkbox" checked={checked2} onChange={(e) => setChecked2(e.target.checked)} className="mt-1 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
            <span className="text-sm text-slate-600">
              Oluşturduğum metindeki verilerin metin üretimi amacıyla üçüncü taraf yapay zeka servislerine iletilmesine izin veriyorum. Üretilen çıktının hukuki tavsiye niteliğinde olmadığını, resmi mercilere sunmadan önce uzman kontrolü yapacağımı kabul ediyorum.
            </span>
          </label>
        </div>
        <p className="mt-4 text-xs text-slate-500">Ödeme sonrası 1 iş günü içinde fatura e-posta ile gönderilir.</p>
        <button
          type="button"
          onClick={handleProceed}
          disabled={!canProceed}
          className="mt-6 w-full rounded-xl bg-brand-600 py-3.5 font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Ödemeye geç
        </button>
      </div>
      <p className="mt-4 text-center text-sm text-slate-500">
        <Link href="/fiyatlandirma" className="text-brand-600 hover:underline">← Fiyatlandırmaya dön</Link>
      </p>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-2xl px-4 py-16 text-center text-slate-600">Yükleniyor…</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
