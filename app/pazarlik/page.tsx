"use client";

import { useState } from "react";
import { incrementUsage } from "@/lib/usage";
import { CopyButton } from "@/components/CopyButton";
import PageHeader from "@/components/PageHeader";
import Disclaimer from "@/components/Disclaimer";

export default function PazarlikPage() {
  const [platform, setPlatform] = useState("");
  const [urun, setUrun] = useState("");
  const [fiyat, setFiyat] = useState("");
  const [hedefFiyat, setHedefFiyat] = useState("");
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
          type: "pazarlik",
          platform: platform || "ikinci el platform",
          urun: urun || "ürün",
          fiyat: fiyat || "belirtilmemiş",
          hedefFiyat: hedefFiyat || "",
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
        title="Pazarlık Modu"
        description="Sahibinden, Letgo, eBay vb. için satıcıyı kırmadan en iyi teklifi yapacak mesaj dizisini hazırlıyoruz."
        icon="🤝"
      />

      <Disclaimer />

      <div className="mb-8 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-6">
        <p className="mb-3 text-sm font-semibold text-slate-700">Platform seçin</p>
        <div className="flex flex-wrap gap-2">
          {["Sahibinden", "Letgo", "eBay", "Facebook Marketplace", "Diğer"].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPlatform(p)}
              className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                platform === p
                  ? "border-brand-500 bg-brand-100 text-brand-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-brand-200 hover:bg-brand-50/50"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Platform
            </label>
            <input
              type="text"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              placeholder="Örn: Sahibinden, Letgo, eBay"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Ürün</label>
            <input
              type="text"
              value={urun}
              onChange={(e) => setUrun(e.target.value)}
              placeholder="Örn: iPhone 14, Laptop, Koltuk takımı"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                İlan fiyatı
              </label>
              <input
                type="text"
                value={fiyat}
                onChange={(e) => setFiyat(e.target.value)}
                placeholder="Örn: 15.000 TL"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Hedef fiyat <span className="text-slate-400">(isteğe bağlı)</span>
              </label>
              <input
                type="text"
                value={hedefFiyat}
                onChange={(e) => setHedefFiyat(e.target.value)}
                placeholder="Örn: 12.000 TL"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={yukleniyor}
            className="w-full rounded-xl bg-brand-600 py-4 font-semibold text-white shadow-soft transition hover:bg-brand-700 disabled:opacity-60"
          >
            {yukleniyor ? "Mesajlar hazırlanıyor…" : "Pazarlık mesajlarını oluştur"}
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
            <h2 className="text-lg font-bold text-slate-900">Mesajlar</h2>
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
