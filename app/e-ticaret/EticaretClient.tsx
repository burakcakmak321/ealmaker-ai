"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthGuard";
import ResultWithBlur from "@/components/ResultWithBlur";
import PageHeader from "@/components/PageHeader";
import PlatformSelector from "@/components/PlatformSelector";
import ToneSelector from "@/components/ToneSelector";
import HumanizeButton from "@/components/HumanizeButton";
import { ETICARET_PLATFORMS } from "@/lib/eticaret-platforms";
import type { TonePreset } from "@/lib/tone-presets";

type InputMode = "simple" | "detailed";

export default function EticaretClient() {
  const { user, loading: authLoading } = useAuth();
  const [platform, setPlatform] = useState("trendyol");
  const [inputMode, setInputMode] = useState<InputMode>("simple");
  const [tone, setTone] = useState<TonePreset>("neutral");
  const [includeSSS, setIncludeSSS] = useState(true);

  const [urunBilgisi, setUrunBilgisi] = useState("");
  const [marka, setMarka] = useState("");
  const [model, setModel] = useState("");
  const [ozellik, setOzellik] = useState("");
  const [renk, setRenk] = useState("");
  const [boyut, setBoyut] = useState("");
  const [fiyat, setFiyat] = useState("");

  const [sonuc, setSonuc] = useState("");
  const [alternativeSonuc, setAlternativeSonuc] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState("");
  const [showBlurred, setShowBlurred] = useState(false);
  const [limitReached, setLimitReached] = useState(false);

  const selectedPlatform = ETICARET_PLATFORMS.find((p) => p.id === platform);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setHata("");
    setSonuc("");
    setAlternativeSonuc("");
    setShowBlurred(false);
    setLimitReached(false);
    setYukleniyor(true);

    try {
      if (!user) {
        await new Promise((r) => setTimeout(r, 1200));
        setShowBlurred(true);
        setYukleniyor(false);
        return;
      }

      const payload = {
        type: "eticaret",
        platform,
        tone,
        includeSSS,
        inputMode,
        ...(inputMode === "simple"
          ? { urunBilgisi }
          : { marka, model, ozellik, renk, boyut, fiyat }),
      };

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.status === 401) {
        setShowBlurred(true);
        setYukleniyor(false);
        return;
      }
      if (res.status === 402) {
        setLimitReached(true);
        setShowBlurred(true);
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

  function handleTransformed(newText: string, mode: "replace" | "alternative") {
    if (mode === "replace") {
      setSonuc(newText);
    } else {
      setAlternativeSonuc(newText);
    }
  }

  const showResult = showBlurred || limitReached || sonuc;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <PageHeader
        title="E-Ticaret Ürün Açıklaması"
        description="Pazar yeri algoritmalarına uygun SEO dostu başlık ve açıklama oluşturun. Trendyol, Hepsiburada, Amazon ve daha fazlası."
        icon="🛒"
      />

      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_4px_24px_-4px_rgba(0,0,0,.08)] sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <PlatformSelector value={platform} onChange={setPlatform} />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Bilgi Giriş Modu</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setInputMode("simple")}
                  className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition ${
                    inputMode === "simple"
                      ? "border-brand-500 bg-brand-50 text-brand-700"
                      : "border-slate-200 bg-white text-slate-600 hover:border-brand-200"
                  }`}
                >
                  📝 Tek Alan (Hızlı)
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode("detailed")}
                  className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition ${
                    inputMode === "detailed"
                      ? "border-brand-500 bg-brand-50 text-brand-700"
                      : "border-slate-200 bg-white text-slate-600 hover:border-brand-200"
                  }`}
                >
                  📋 Detaylı Alanlar
                </button>
              </div>
            </div>

            {inputMode === "simple" ? (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Ürün Bilgisi
                </label>
                <textarea
                  value={urunBilgisi}
                  onChange={(e) => setUrunBilgisi(e.target.value)}
                  placeholder="Örn: Samsung Galaxy S24 Ultra, 256GB, Titanium Gri, 200MP kamera, S Pen destekli..."
                  rows={4}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Marka, model, özellikler, renk, boyut gibi bilgileri yazın. AI en uygun formatı oluşturacak.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Marka</label>
                  <input
                    type="text"
                    value={marka}
                    onChange={(e) => setMarka(e.target.value)}
                    placeholder="Örn: Samsung, Apple, Nike"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Model</label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="Örn: Galaxy S24 Ultra, iPhone 15 Pro"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Ana Özellikler
                  </label>
                  <textarea
                    value={ozellik}
                    onChange={(e) => setOzellik(e.target.value)}
                    placeholder="Örn: 256GB hafıza, 200MP kamera, AMOLED ekran, 5000mAh batarya..."
                    rows={2}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Renk</label>
                  <input
                    type="text"
                    value={renk}
                    onChange={(e) => setRenk(e.target.value)}
                    placeholder="Örn: Titanium Gri, Mavi, Siyah"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Boyut / Beden
                  </label>
                  <input
                    type="text"
                    value={boyut}
                    onChange={(e) => setBoyut(e.target.value)}
                    placeholder="Örn: M, 42, 256GB, 15.6 inç"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Fiyat <span className="text-slate-400">(isteğe bağlı)</span>
                  </label>
                  <input
                    type="text"
                    value={fiyat}
                    onChange={(e) => setFiyat(e.target.value)}
                    placeholder="Örn: 45.999 TL"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>
            )}

            <ToneSelector value={tone} onChange={setTone} />

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="includeSSS"
                checked={includeSSS}
                onChange={(e) => setIncludeSSS(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <label htmlFor="includeSSS" className="text-sm text-slate-700">
                <span className="font-medium">Müşteri SSS oluştur</span>
                <span className="ml-1 text-slate-500">
                  (Sık sorulan sorular ve cevapları otomatik hazırla)
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={yukleniyor || authLoading}
              className="w-full rounded-xl bg-brand-600 py-4 font-semibold text-white shadow-soft transition hover:bg-brand-700 disabled:opacity-60"
            >
              {yukleniyor ? "Oluşturuluyor…" : "Ürün Açıklaması Oluştur"}
            </button>
          </form>
        </div>

        {hata && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {hata}
          </div>
        )}

        {showResult && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                {selectedPlatform?.name} İçin Hazırlanan İçerik
              </h3>
              {sonuc && !showBlurred && !limitReached && (
                <HumanizeButton text={sonuc} onTransformed={handleTransformed} />
              )}
            </div>
            <ResultWithBlur
              text={sonuc}
              title="Başlık ve Açıklama"
              copyLabel="Kopyala"
              blurred={showBlurred && !limitReached}
              limitReached={limitReached}
            />
            {alternativeSonuc && (
              <ResultWithBlur
                text={alternativeSonuc}
                title="Alternatif Versiyon"
                copyLabel="Kopyala"
                blurred={false}
                limitReached={false}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
