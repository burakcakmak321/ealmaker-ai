"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthGuard";
import ResultWithBlur from "@/components/ResultWithBlur";
import PageHeader from "@/components/PageHeader";
import Disclaimer from "@/components/Disclaimer";

export default function PazarlikPage() {
  const { user, loading: authLoading } = useAuth();
  const [platform, setPlatform] = useState("");
  const [urun, setUrun] = useState("");
  const [fiyat, setFiyat] = useState("");
  const [hedefFiyat, setHedefFiyat] = useState("");
  const [sonuc, setSonuc] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState("");
  const [showBlurred, setShowBlurred] = useState(false);
  const [limitReached, setLimitReached] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setHata("");
    setSonuc("");
    setShowBlurred(false);
    setLimitReached(false);
    setYukleniyor(true);
    try {
      if (!user) {
        await new Promise((r) => setTimeout(r, 1200));
        setShowBlurred(true);
        setSonuc("");
        setYukleniyor(false);
        return;
      }
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
      if (res.status === 401) {
        setShowBlurred(true);
        setSonuc("");
        setHata("");
        setYukleniyor(false);
        return;
      }
      if (res.status === 402) {
        setLimitReached(true);
        setShowBlurred(true);
        setSonuc("");
        setHata("");
        setYukleniyor(false);
        return;
      }
      if (!res.ok) throw new Error(data.error || "Bir hata oluştu.");
      setSonuc(data.text);
    } catch (err) {
      setHata(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setYukleniyor(false);
    }
  }

  const showResult = showBlurred || limitReached || sonuc;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <PageHeader
        title="AI Destekli Pazarlık Mesajı"
        description="Sahibinden, Letgo, eBay vb. için AI destekli profesyonel pazarlık mesajı taslağı. Satıcıyı kırmadan en iyi teklifi alın."
        icon="🤝"
      />

      <Disclaimer />

      <div className="mb-8 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-6 shadow-[0_1px_3px_rgba(0,0,0,.04)]">
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

      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_4px_24px_-4px_rgba(0,0,0,.08)] sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Platform</label>
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
              <label className="mb-1.5 block text-sm font-medium text-slate-700">İlan fiyatı</label>
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
            disabled={yukleniyor || authLoading}
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

      {showResult && (
        <ResultWithBlur
          text={sonuc}
          title="Mesajlar"
          copyLabel="Kopyala"
          blurred={showBlurred && !limitReached}
          limitReached={limitReached}
        />
      )}
    </div>
  );
}
