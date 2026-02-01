"use client";

import { useState } from "react";
import { incrementUsage } from "@/lib/usage";
import { CopyButton } from "@/components/CopyButton";
import PageHeader from "@/components/PageHeader";
import Disclaimer from "@/components/Disclaimer";

export default function FaturaPage() {
  const [kurum, setKurum] = useState("");
  const [konu, setKonu] = useState("");
  const [detay, setDetay] = useState("");
  const [sonuc, setSonuc] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setHata("");
    setSonuc("");
    setYukleniyor(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "fatura",
          kurum: kurum || "ilgili kurum",
          konu: konu || "fatura itirazı",
          detay,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Bir hata oluştu.");
      incrementUsage();
      setSonuc(data.text);
    } catch (err) {
      setHata(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setYukleniyor(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <PageHeader
        title="Fatura & Abonelik İtirazı"
        description="İnternet, banka veya operatör faturanız için indirim veya iade talebinizi kurumun dilinde, hukuki jargonla yazıyoruz."
        icon="📄"
      />

      <Disclaimer />

      <div className="mb-8 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-6">
        <p className="mb-3 text-sm font-semibold text-slate-700">Hızlı senaryo</p>
        <div className="flex flex-wrap gap-2">
          {[
            { kurum: "Turkcell / Türk Telekom / Vodafone", konu: "İnternet / hat faturası indirim talebi" },
            { kurum: "Banka", konu: "Haksız kesilen aidat / ücret iadesi talebi" },
            { kurum: "Operatör", konu: "Abonelik iptali / sözleşme feshi" },
            { kurum: "Elektrik / Su / Doğalgaz", konu: "Fatura itirazı / taksitlendirme talebi" },
          ].map((s) => (
            <button
              key={s.konu}
              type="button"
              onClick={() => {
                setKurum(s.kurum);
                setKonu(s.konu);
              }}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-brand-200 hover:bg-brand-50/50"
            >
              {s.konu.split(" ")[0]}...
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Kurum adı
            </label>
            <input
              type="text"
              value={kurum}
              onChange={(e) => setKurum(e.target.value)}
              placeholder="Örn: Turkcell, Türk Telekom, X Bankası"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Konu</label>
            <input
              type="text"
              value={konu}
              onChange={(e) => setKonu(e.target.value)}
              placeholder="Örn: Yüksek gelen internet faturası, haksız kesilen aidat"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Detay <span className="text-slate-400">(isteğe bağlı)</span>
            </label>
            <textarea
              value={detay}
              onChange={(e) => setDetay(e.target.value)}
              placeholder="Fatura tutarı, tarih, müşteri no vb."
              rows={3}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <button
            type="submit"
            disabled={yukleniyor}
            className="w-full rounded-xl bg-brand-600 py-4 font-semibold text-white shadow-soft transition hover:bg-brand-700 disabled:opacity-60"
          >
            {yukleniyor ? "Metin yazılıyor…" : "Dilekçe / mesaj metnini oluştur"}
          </button>
        </form>
      </div>

      {hata && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {hata}
        </div>
      )}

      {sonuc && (
        <div className="mt-10 animate-fade-in rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card sm:p-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-900">Oluşan metin</h2>
            <CopyButton text={sonuc} label="Kopyala" />
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-5">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-800">
              {sonuc}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
