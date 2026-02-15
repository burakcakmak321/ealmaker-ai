"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthGuard";
import ResultWithBlur from "@/components/ResultWithBlur";
import PageHeader from "@/components/PageHeader";
import ToneSelector from "@/components/ToneSelector";
import HumanizeButton from "@/components/HumanizeButton";
import type { TonePreset } from "@/lib/tone-presets";

type ToolType = "outline" | "meta" | "title" | "keywords";

const TOOLS = [
  { id: "outline" as ToolType, label: "Blog Yazısı Planı", icon: "📑", desc: "Yazının başlıklar, alt başlıklar ve içerik taslağı" },
  { id: "meta" as ToolType, label: "Google Açıklaması", icon: "🔍", desc: "Google arama sonuçlarında görünecek kısa tanıtım" },
  { id: "title" as ToolType, label: "Başlık Önerileri", icon: "✏️", desc: "Dikkat çekici, tıklanma oranı yüksek başlıklar" },
  { id: "keywords" as ToolType, label: "Anahtar Kelime Bul", icon: "🔑", desc: "İnsanların aradığı ilişkili kelimeler" },
];

const BLOG_CATEGORIES = [
  { id: "teknoloji", label: "Teknoloji" },
  { id: "saglik", label: "Saglik" },
  { id: "finans", label: "Finans / Ekonomi" },
  { id: "egitim", label: "Egitim" },
  { id: "yasam", label: "Yasam / Lifestyle" },
  { id: "pazarlama", label: "Dijital Pazarlama" },
  { id: "girisimcilik", label: "Girisimcilik" },
  { id: "diger", label: "Diger" },
];

export default function BlogSeoClient() {
  const { user, loading: authLoading } = useAuth();
  const [tool, setTool] = useState<ToolType>("outline");
  const [tone, setTone] = useState<TonePreset>("neutral");
  const [anahtarKelime, setAnahtarKelime] = useState("");
  const [konu, setKonu] = useState("");
  const [kategori, setKategori] = useState("");
  const [hedefKitle, setHedefKitle] = useState("");
  const [kelimeSayisi, setKelimeSayisi] = useState("1500");

  const [sonuc, setSonuc] = useState("");
  const [alternativeSonuc, setAlternativeSonuc] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState("");
  const [showBlurred, setShowBlurred] = useState(false);
  const [limitReached, setLimitReached] = useState(false);

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
        type: "blogseo",
        tool,
        tone,
        anahtarKelime,
        konu,
        kategori,
        hedefKitle,
        kelimeSayisi,
      };

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.status === 401) { setShowBlurred(true); setYukleniyor(false); return; }
      if (res.status === 402) { setLimitReached(true); setShowBlurred(true); setYukleniyor(false); return; }
      if (!res.ok) throw new Error(data.error || "Bir hata oluştu.");
      setSonuc(data.text);
    } catch (err) {
      setHata(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setYukleniyor(false);
    }
  }

  function handleTransformed(newText: string, mode: "replace" | "alternative") {
    if (mode === "replace") setSonuc(newText);
    else setAlternativeSonuc(newText);
  }

  const showResult = showBlurred || limitReached || sonuc;
  const selectedTool = TOOLS.find((t) => t.id === tool);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <PageHeader
        title="Blog & SEO Araclari"
        description="Blog yazisi planlama, Google icin aciklama yazma, baslik onerme ve anahtar kelime bulma araclari."
        icon="📝"
      />

      <div className="mb-8 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
        <h3 className="flex items-center gap-2 font-bold text-blue-800">
          <span>💡</span> Bu sayfa ne işe yarar?
        </h3>
        <ul className="mt-3 space-y-2 text-sm text-blue-700">
          <li className="flex items-start gap-2">
            <span>📑</span>
            <span><strong>Blog Yazısı Planı:</strong> Yazmak istediğiniz konunun başlıklar, alt başlıklar ve içerik taslağını çıkarır.</span>
          </li>
          <li className="flex items-start gap-2">
            <span>🔍</span>
            <span><strong>Google Açıklaması:</strong> Siteniz Google&apos;da çıktığında altında görünen kısa tanıtım yazılarını oluşturur.</span>
          </li>
          <li className="flex items-start gap-2">
            <span>✏️</span>
            <span><strong>Başlık Önerileri:</strong> İnsanların tıklamak isteyeceği dikkat çekici başlıklar oluşturur.</span>
          </li>
          <li className="flex items-start gap-2">
            <span>🔑</span>
            <span><strong>Anahtar Kelime Bul:</strong> İnsanların Google&apos;da ne aradığını bulur, içeriğinizi ona göre yazarsınız.</span>
          </li>
        </ul>
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_4px_24px_-4px_rgba(0,0,0,.08)] sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700">Ne olusturmak istiyorsunuz?</label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {TOOLS.map((t) => {
                  const isSelected = tool === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTool(t.id)}
                      className={`flex flex-col items-start gap-1.5 rounded-xl border p-3 text-left transition ${
                        isSelected
                          ? "border-brand-500 bg-brand-50 shadow-sm"
                          : "border-slate-200 bg-white hover:border-brand-200"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{t.icon}</span>
                        <span className={`text-sm font-semibold ${isSelected ? "text-brand-700" : "text-slate-700"}`}>
                          {t.label}
                        </span>
                      </div>
                      <p className={`text-xs ${isSelected ? "text-brand-600" : "text-slate-500"}`}>
                        {t.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Konu veya Anahtar Kelime <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={anahtarKelime}
                onChange={(e) => setAnahtarKelime(e.target.value)}
                placeholder="Örn: dijital pazarlama, sağlıklı beslenme, ev dekorasyonu, kilo verme"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Konu Detayi <span className="text-slate-400">(istege bagli)</span>
              </label>
              <textarea
                value={konu}
                onChange={(e) => setKonu(e.target.value)}
                placeholder="Blog yazısının odaklanmasını istediğiniz spesifik konuyu yazın..."
                rows={3}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Kategori</label>
                <select
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  <option value="">Seçin</option>
                  {BLOG_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Hedef Kitle</label>
                <input
                  type="text"
                  value={hedefKitle}
                  onChange={(e) => setHedefKitle(e.target.value)}
                  placeholder="Örn: başlangıç, uzman"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
              {tool === "outline" && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Kelime Sayisi</label>
                  <select
                    value={kelimeSayisi}
                    onChange={(e) => setKelimeSayisi(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  >
                    <option value="800">Kısa (~800 kelime)</option>
                    <option value="1500">Orta (~1500 kelime)</option>
                    <option value="2500">Uzun (~2500 kelime)</option>
                    <option value="4000">Çok Uzun (~4000 kelime)</option>
                  </select>
                </div>
              )}
            </div>

            <ToneSelector value={tone} onChange={setTone} />

            <button
              type="submit"
              disabled={yukleniyor || authLoading || !anahtarKelime.trim()}
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-4 font-semibold text-white shadow-lg transition hover:opacity-90 disabled:opacity-60"
            >
              {yukleniyor ? "Oluşturuluyor..." : `${selectedTool?.label} Oluştur`}
            </button>
          </form>
        </div>

        {hata && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{hata}</div>
        )}

        {showResult && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">{selectedTool?.label}</h3>
              {sonuc && !showBlurred && !limitReached && (
                <HumanizeButton text={sonuc} onTransformed={handleTransformed} />
              )}
            </div>
            <ResultWithBlur text={sonuc} title={selectedTool?.label || "Sonuc"} copyLabel="Kopyala" blurred={showBlurred && !limitReached} limitReached={limitReached} />
            {alternativeSonuc && (
              <ResultWithBlur text={alternativeSonuc} title="Alternatif Versiyon" copyLabel="Kopyala" blurred={false} limitReached={false} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
