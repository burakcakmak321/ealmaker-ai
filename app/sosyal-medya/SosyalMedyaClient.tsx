"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthGuard";
import ResultWithBlur from "@/components/ResultWithBlur";
import PageHeader from "@/components/PageHeader";
import ToneSelector from "@/components/ToneSelector";
import HumanizeButton from "@/components/HumanizeButton";
import { SOCIAL_PLATFORMS, CONTENT_TYPES } from "@/lib/social-media-config";
import type { TonePreset } from "@/lib/tone-presets";

type ContentType = "hook" | "scenario" | "caption" | "cta" | "all";

const ICERIK_TURLERI = [
  { id: "egitim", label: "Eğitim / Bilgi", icon: "📚", desc: "Bilgilendirici, öğretici içerik" },
  { id: "eglence", label: "Eğlence / Viral", icon: "🎉", desc: "Eğlenceli, paylaşılabilir içerik" },
  { id: "urun", label: "Ürün / Satış", icon: "🛍️", desc: "Ürün tanıtımı, satış odaklı" },
  { id: "hikaye", label: "Hikaye / Deneyim", icon: "📖", desc: "Kişisel deneyim, hikaye anlatımı" },
  { id: "haber", label: "Haber / Gündem", icon: "📰", desc: "Güncel olaylar, haberler" },
  { id: "motivasyon", label: "Motivasyon", icon: "💪", desc: "İlham verici, motive edici" },
];

const AMACLAR = [
  { id: "takipci", label: "Takipçi Kazanmak", icon: "👥" },
  { id: "etkilesim", label: "Etkileşim Artırmak", icon: "💬" },
  { id: "satis", label: "Satış Yapmak", icon: "💰" },
  { id: "bilinirlik", label: "Marka Bilinirliği", icon: "🏷️" },
  { id: "trafik", label: "Web Trafiği", icon: "🔗" },
  { id: "topluluk", label: "Topluluk Oluşturmak", icon: "🤝" },
];

export default function SosyalMedyaClient() {
  const { user, loading: authLoading } = useAuth();
  const [platform, setPlatform] = useState<keyof typeof SOCIAL_PLATFORMS>("instagram");
  const [contentType, setContentType] = useState<ContentType>("all");
  const [tone, setTone] = useState<TonePreset>("friendly");
  const [includeTactics, setIncludeTactics] = useState(true);
  const [includeHashtags, setIncludeHashtags] = useState(true);

  const [konu, setKonu] = useState("");
  const [icerikTuru, setIcerikTuru] = useState("");
  const [hedefKitle, setHedefKitle] = useState("");
  const [amac, setAmac] = useState("");
  const [ekBilgi, setEkBilgi] = useState("");

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

      const fullKonu = ekBilgi ? `${konu}. Ek bilgi: ${ekBilgi}` : konu;

      const payload = {
        type: "sosyalmedya",
        platform,
        contentType,
        tone,
        includeTactics,
        hashtags: includeHashtags,
        konu: fullKonu,
        icerikTuru: ICERIK_TURLERI.find((t) => t.id === icerikTuru)?.label || "",
        hedefKitle,
        amac: AMACLAR.find((a) => a.id === amac)?.label || "",
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
        description="Viral hooklar, video senaryoları, dikkat çekici captionlar ve etkili CTA'lar. Konunuza özel, profesyonel içerikler."
        icon="📱"
      />

      <div className="mb-8 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-6">
        <h3 className="flex items-center gap-2 font-bold text-emerald-800">
          <span>✨</span> Farkımız
        </h3>
        <p className="mt-2 text-sm text-emerald-700">
          Genel kalıp cümleler değil, <strong>konunuza özel</strong> içerikler üretiyoruz.
          Her öneriyle birlikte <strong>neden işe yaradığını</strong> açıklıyoruz - böylece sadece içerik değil, strateji de öğrenirsiniz.
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
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Konu / İçerik <span className="text-red-500">*</span>
              </label>
              <textarea
                value={konu}
                onChange={(e) => setKonu(e.target.value)}
                placeholder="Örn: Osmanlı'nın İstanbul'u fethi, Yeni açtığım kahve dükkanı, iPhone 15 Pro inceleme, Kilo verme yolculuğum..."
                rows={3}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                required
              />
              <p className="mt-1 text-xs text-slate-500">
                Ne hakkında içerik oluşturmak istiyorsunuz? Detaylı yazarsanız daha iyi sonuç alırsınız.
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Ek Bilgi / Detay <span className="text-slate-400">(isteğe bağlı)</span>
              </label>
              <textarea
                value={ekBilgi}
                onChange={(e) => setEkBilgi(e.target.value)}
                placeholder="Örn: Videonun sonunda ürün satışı yapacağım, Tarihsel doğruluğa dikkat edilsin, Genç kitleye hitap etsin..."
                rows={2}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700">İçerik Türü</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {ICERIK_TURLERI.map((tur) => {
                  const isSelected = icerikTuru === tur.id;
                  return (
                    <button
                      key={tur.id}
                      type="button"
                      onClick={() => setIcerikTuru(isSelected ? "" : tur.id)}
                      className={`flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition ${
                        isSelected
                          ? "border-brand-500 bg-brand-50"
                          : "border-slate-200 bg-white hover:border-brand-200"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{tur.icon}</span>
                        <span className={`text-sm font-medium ${isSelected ? "text-brand-700" : "text-slate-700"}`}>
                          {tur.label}
                        </span>
                      </div>
                      <p className={`text-xs ${isSelected ? "text-brand-600" : "text-slate-500"}`}>
                        {tur.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700">Ne Oluşturulsun?</label>
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

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Hedef Kitle <span className="text-slate-400">(isteğe bağlı)</span>
                </label>
                <input
                  type="text"
                  value={hedefKitle}
                  onChange={(e) => setHedefKitle(e.target.value)}
                  placeholder="Örn: 18-25 yaş gençler, anneler, girişimciler"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Amaç</label>
                <select
                  value={amac}
                  onChange={(e) => setAmac(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  <option value="">Seçin (isteğe bağlı)</option>
                  {AMACLAR.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.icon} {a.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <ToneSelector value={tone} onChange={setTone} />

            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={includeTactics}
                  onChange={(e) => setIncludeTactics(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                />
                <span className="text-sm text-slate-700">
                  <span className="font-medium">Taktik açıklamaları</span>
                  <span className="ml-1 text-slate-500">(neden işe yarar?)</span>
                </span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={includeHashtags}
                  onChange={(e) => setIncludeHashtags(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                />
                <span className="text-sm text-slate-700">
                  <span className="font-medium">Hashtag önerileri</span>
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={yukleniyor || authLoading || !konu.trim()}
              className="w-full rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 py-4 font-semibold text-white shadow-lg transition hover:opacity-90 disabled:opacity-60"
            >
              {yukleniyor ? "İçerik Oluşturuluyor…" : "İçerik Oluştur"}
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
