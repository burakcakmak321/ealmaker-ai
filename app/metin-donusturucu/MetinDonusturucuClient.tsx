"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthGuard";
import ResultWithBlur from "@/components/ResultWithBlur";
import PageHeader from "@/components/PageHeader";
import Disclaimer from "@/components/Disclaimer";
import { TRANSFORMATION_TYPES, type TransformationType } from "@/lib/tone-presets";
import { CopyButton } from "@/components/CopyButton";

export default function MetinDonusturucuClient() {
  const { user, loading: authLoading } = useAuth();
  const [kaynakMetin, setKaynakMetin] = useState("");
  const [selectedType, setSelectedType] = useState<TransformationType>("humanize");

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
        setYukleniyor(false);
        return;
      }

      const res = await fetch("/api/humanize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: kaynakMetin, transformationType: selectedType }),
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

  const showResult = showBlurred || limitReached || sonuc;
  const charCount = kaynakMetin.length;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <PageHeader
        title="Metin Dönüştürücü"
        description="Metninizi resmi, sade, profesyonel veya insan yazısı gibi dönüştürün. AI tarafından yazılmış metinleri doğallaştırın."
        icon="🔄"
      />

      <Disclaimer />

      <div className="mb-8 rounded-2xl border border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50 p-6">
        <h3 className="flex items-center gap-2 font-bold text-purple-800">
          <span>🧑</span> İnsanlaştırma Özelliği
        </h3>
        <p className="mt-2 text-sm text-purple-700">
          AI tespit araçları metninizi &quot;yapay zeka tarafından yazılmış&quot; olarak işaretliyor mu?
          <strong> İnsanlaştır</strong> özelliği ile metninizi daha öznel, doğal ve insan yazısı gibi dönüştürün.
        </p>
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_4px_24px_-4px_rgba(0,0,0,.08)] sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Kaynak Metin
              </label>
              <textarea
                value={kaynakMetin}
                onChange={(e) => setKaynakMetin(e.target.value)}
                placeholder="Dönüştürmek istediğiniz metni buraya yapıştırın..."
                rows={8}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
              <p className="mt-1 text-xs text-slate-500">{charCount} karakter</p>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700">Dönüşüm Türü</label>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {(Object.keys(TRANSFORMATION_TYPES) as TransformationType[]).map((key) => {
                  const type = TRANSFORMATION_TYPES[key];
                  const isSelected = selectedType === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedType(key)}
                      className={`flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition ${
                        isSelected
                          ? "border-brand-500 bg-brand-50 shadow-sm"
                          : "border-slate-200 bg-white hover:border-brand-200 hover:bg-brand-50/50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{type.icon}</span>
                        <span className={`font-semibold ${isSelected ? "text-brand-700" : "text-slate-800"}`}>
                          {type.label}
                        </span>
                      </div>
                      <p className={`text-xs ${isSelected ? "text-brand-600" : "text-slate-500"}`}>
                        {type.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={yukleniyor || authLoading || !kaynakMetin.trim()}
              className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 py-4 font-semibold text-white shadow-lg transition hover:opacity-90 disabled:opacity-60"
            >
              {yukleniyor ? "Dönüştürülüyor…" : `${TRANSFORMATION_TYPES[selectedType].label}`}
            </button>
          </form>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h4 className="mb-3 text-sm font-bold text-slate-800">💡 Kullanım İpuçları</h4>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <span>•</span>
              <span><strong>İnsanlaştır:</strong> AI tespit araçlarından kaçınmak için. ChatGPT, Claude vb. çıktıları için ideal.</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span><strong>Resmi:</strong> İş mektupları, resmi yazışmalar, kurumsal iletişim için.</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span><strong>Sade:</strong> Uzun ve karmaşık cümleleri kısaltmak için.</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span><strong>Profesyonel:</strong> LinkedIn, CV, iş başvuruları için.</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span><strong>İkna Edici:</strong> Satış, pazarlama, sunum metinleri için.</span>
            </li>
          </ul>
        </div>

        {hata && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {hata}
          </div>
        )}

        {showResult && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Dönüştürülmüş Metin</h3>
              {sonuc && !showBlurred && !limitReached && (
                <CopyButton text={sonuc} label="Kopyala" />
              )}
            </div>
            <ResultWithBlur
              text={sonuc}
              title={TRANSFORMATION_TYPES[selectedType].label}
              copyLabel="Kopyala"
              blurred={showBlurred && !limitReached}
              limitReached={limitReached}
            />
          </div>
        )}

        {sonuc && kaynakMetin && !showBlurred && !limitReached && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <h4 className="mb-2 text-sm font-bold text-slate-700">Orijinal</h4>
              <p className="text-sm text-slate-600 line-clamp-6">{kaynakMetin}</p>
              <p className="mt-2 text-xs text-slate-400">{kaynakMetin.length} karakter</p>
            </div>
            <div className="rounded-xl border border-brand-200 bg-brand-50 p-4">
              <h4 className="mb-2 text-sm font-bold text-brand-700">Dönüştürülmüş</h4>
              <p className="text-sm text-slate-700 line-clamp-6">{sonuc}</p>
              <p className="mt-2 text-xs text-brand-500">{sonuc.length} karakter</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
