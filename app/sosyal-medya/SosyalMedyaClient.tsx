"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthGuard";
import ResultWithBlur from "@/components/ResultWithBlur";
import PageHeader from "@/components/PageHeader";
import Disclaimer from "@/components/Disclaimer";
import ToneSelector from "@/components/ToneSelector";
import HumanizeButton from "@/components/HumanizeButton";
import { SOCIAL_PLATFORMS, CONTENT_TYPES, HOOK_TEMPLATES, CTA_TEMPLATES } from "@/lib/social-media-config";
import type { TonePreset } from "@/lib/tone-presets";

type ContentType = "hook" | "scenario" | "caption" | "cta" | "all";

export default function SosyalMedyaClient() {
  const { user, loading: authLoading } = useAuth();
  const [platform, setPlatform] = useState<keyof typeof SOCIAL_PLATFORMS>("instagram");
  const [contentType, setContentType] = useState<ContentType>("all");
  const [tone, setTone] = useState<TonePreset>("friendly");
  const [includeTactics, setIncludeTactics] = useState(true);

  const [konu, setKonu] = useState("");
  const [hedefKitle, setHedefKitle] = useState("");
  const [amac, setAmac] = useState("");

  const [sonuc, setSonuc] = useState("");
  const [alternativeSonuc, setAlternativeSonuc] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState("");
  const [showBlurred, setShowBlurred] = useState(false);
  const [limitReached, setLimitReached] = useState(false);

  const selectedPlatform = SOCIAL_PLATFORMS[platform];

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
        type: "sosyalmedya",
        platform,
        contentType,
        tone,
        includeTactics,
        konu,
        hedefKitle,
        amac,
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
        title="Sosyal Medya İçerik Asistanı"
        description="Viral hooklar, video senaryoları, dikkat çekici captionlar ve etkili CTA'lar. Her içeriğin yanında neden işe yaradığını öğrenin."
        icon="📱"
      />

      <Disclaimer />

      <div className="mb-8 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-6">
        <h3 className="flex items-center gap-2 font-bold text-amber-800">
          <span>💡</span> Neden Farklıyız?
        </h3>
        <p className="mt-2 text-sm text-amber-700">
          Sadece içerik üretmiyoruz — her önerinin arkasındaki <strong>stratejiyi</strong> de açıklıyoruz.
          Hook&apos;un neden işe yaradığını, CTA&apos;nın hangi psikolojik prensibi kullandığını öğrenin.
        </p>
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_4px_24px_-4px_rgba(0,0,0,.08)] sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700">Platform</label>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(SOCIAL_PLATFORMS) as (keyof typeof SOCIAL_PLATFORMS)[]).map((key) => {
                  const p = SOCIAL_PLATFORMS[key];
                  const isSelected = platform === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setPlatform(key)}
                      className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                        isSelected
                          ? "border-brand-500 bg-brand-50 text-brand-700 shadow-sm"
                          : "border-slate-200 bg-white text-slate-600 hover:border-brand-200 hover:bg-brand-50/50"
                      }`}
                    >
                      <span className="text-lg">{p.icon}</span>
                      <span>{p.name}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-slate-500">
                Max {selectedPlatform.maxCaptionLength} karakter · {selectedPlatform.hashtagLimit} hashtag
              </p>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700">İçerik Türü</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => setContentType("all")}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                    contentType === "all"
                      ? "border-brand-500 bg-brand-50 text-brand-700"
                      : "border-slate-200 bg-white text-slate-600 hover:border-brand-200"
                  }`}
                >
                  ✨ Hepsini Oluştur
                </button>
                {(Object.keys(CONTENT_TYPES) as (keyof typeof CONTENT_TYPES)[]).map((key) => {
                  const type = CONTENT_TYPES[key];
                  const isSelected = contentType === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setContentType(key as ContentType)}
                      className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                        isSelected
                          ? "border-brand-500 bg-brand-50 text-brand-700"
                          : "border-slate-200 bg-white text-slate-600 hover:border-brand-200"
                      }`}
                    >
                      <span>{type.icon}</span>
                      <span className="truncate">{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Konu / Ürün / Hizmet
              </label>
              <textarea
                value={konu}
                onChange={(e) => setKonu(e.target.value)}
                placeholder="Örn: Yeni açtığım kahve dükkanı, online kurs satışı, kişisel gelişim içerikleri..."
                rows={3}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Hedef Kitle <span className="text-slate-400">(isteğe bağlı)</span>
                </label>
                <input
                  type="text"
                  value={hedefKitle}
                  onChange={(e) => setHedefKitle(e.target.value)}
                  placeholder="Örn: 25-35 yaş kadınlar, girişimciler, öğrenciler"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Amaç <span className="text-slate-400">(isteğe bağlı)</span>
                </label>
                <input
                  type="text"
                  value={amac}
                  onChange={(e) => setAmac(e.target.value)}
                  placeholder="Örn: Takipçi artırmak, satış yapmak, marka bilinirliği"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>

            <ToneSelector value={tone} onChange={setTone} />

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="includeTactics"
                checked={includeTactics}
                onChange={(e) => setIncludeTactics(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <label htmlFor="includeTactics" className="text-sm text-slate-700">
                <span className="font-medium">Taktik açıklamalarını ekle</span>
                <span className="ml-1 text-slate-500">
                  (Her öneri için neden işe yaradığını açıkla)
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={yukleniyor || authLoading || !konu.trim()}
              className="w-full rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 py-4 font-semibold text-white shadow-lg transition hover:opacity-90 disabled:opacity-60"
            >
              {yukleniyor ? "Oluşturuluyor…" : "İçerik Oluştur"}
            </button>
          </form>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
              <span>🪝</span> Hook İlham Kaynakları
            </h4>
            <div className="space-y-2">
              {HOOK_TEMPLATES.slice(0, 4).map((h, i) => (
                <div key={i} className="rounded-lg bg-white p-2 text-xs">
                  <p className="font-medium text-slate-700">&quot;{h.template}&quot;</p>
                  <p className="mt-1 text-slate-500">💡 {h.tactic}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
              <span>🎯</span> CTA Örnekleri
            </h4>
            <div className="space-y-2">
              {CTA_TEMPLATES.slice(0, 4).map((c, i) => (
                <div key={i} className="rounded-lg bg-white p-2 text-xs">
                  <p className="font-medium text-slate-700">&quot;{c.text}&quot;</p>
                  <p className="mt-1 text-slate-500">📌 {c.context}</p>
                </div>
              ))}
            </div>
          </div>
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
                {selectedPlatform.name} İçeriği
              </h3>
              {sonuc && !showBlurred && !limitReached && (
                <HumanizeButton text={sonuc} onTransformed={handleTransformed} />
              )}
            </div>
            <ResultWithBlur
              text={sonuc}
              title="Oluşturulan İçerik"
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
