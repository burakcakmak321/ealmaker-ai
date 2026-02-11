"use client";

import { useState, useRef, useCallback } from "react";
import { useAuth } from "@/components/AuthGuard";
import ResultWithBlur from "@/components/ResultWithBlur";
import PageHeader from "@/components/PageHeader";
import Disclaimer from "@/components/Disclaimer";

const HAZIR_POZISYONLAR = [
  "Yazılım Geliştirici",
  "Pazarlama Uzmanı",
  "Muhasebe",
  "İnsan Kaynakları",
  "Satış Temsilcisi",
  "Grafik Tasarımcı",
];

export default function CVPage() {
  const { user, loading: authLoading } = useAuth();
  const [adSoyad, setAdSoyad] = useState("");
  const [hedefPozisyon, setHedefPozisyon] = useState("");
  const [ozet, setOzet] = useState("");
  const [deneyim, setDeneyim] = useState("");
  const [egitim, setEgitim] = useState("");
  const [beceriler, setBeceriler] = useState("");
  const [dil, setDil] = useState("");
  const [sonuc, setSonuc] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState("");
  const [showBlurred, setShowBlurred] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const hedefPozisyonInputRef = useRef<HTMLInputElement>(null);

  const handlePozisyonSec = useCallback((p: string) => {
    setHedefPozisyon(p);
    hedefPozisyonInputRef.current?.focus();
  }, []);

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
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "cv",
          adSoyad: adSoyad || "Kullanıcı",
          hedefPozisyon: hedefPozisyon || "Belirtilmedi",
          ozet,
          deneyim,
          egitim,
          beceriler,
          dil,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
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
      if (err instanceof Error) {
        setHata(err.name === "AbortError" ? "İstek zaman aşımına uğradı. Tekrar deneyin." : err.message);
      } else {
        setHata("Bir hata oluştu.");
      }
    } finally {
      setYukleniyor(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  const showResult = showBlurred || limitReached || sonuc;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <PageHeader
        title="AI Destekli CV Taslağı"
        description="Deneyim, eğitim ve becerilerinizi girin; AI destekli profesyonel CV taslağı oluşturalım. Kendi ihtiyaçlarınıza göre düzenleyebilirsiniz."
        icon="📋"
      />

      <Disclaimer />

      <div className="mb-8 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-6 shadow-[0_1px_3px_rgba(0,0,0,.04)]">
        <p className="mb-3 text-sm font-semibold text-slate-700">Hızlı örnek pozisyonlar</p>
        <div className="flex flex-wrap gap-2">
          {HAZIR_POZISYONLAR.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => handlePozisyonSec(p)}
              className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                hedefPozisyon === p
                  ? "border-brand-500 bg-brand-100 text-brand-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-brand-200 hover:bg-brand-50/50"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        {hedefPozisyon && (
          <p className="mt-2 text-xs text-slate-500">
            Seçilen: <strong>{hedefPozisyon}</strong> — aşağıdaki &quot;Hedef pozisyon&quot; alanında görünür.
          </p>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_4px_24px_-4px_rgba(0,0,0,.08)] sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Ad Soyad</label>
              <input
                type="text"
                value={adSoyad}
                onChange={(e) => setAdSoyad(e.target.value)}
                placeholder="Örn: Ahmet Yılmaz"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Hedef pozisyon / Meslek</label>
              <input
                ref={hedefPozisyonInputRef}
                type="text"
                value={hedefPozisyon}
                onChange={(e) => setHedefPozisyon(e.target.value)}
                placeholder="Örn: Frontend Geliştirici veya yukarıdan seçin"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                aria-describedby="hedef-pozisyon-desc"
              />
              <span id="hedef-pozisyon-desc" className="sr-only">
                Yukarıdaki hazır pozisyonlardan birini seçebilir veya kendiniz yazabilirsiniz.
              </span>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Profesyonel özet</label>
            <textarea
              value={ozet}
              onChange={(e) => setOzet(e.target.value)}
              placeholder="Kendinizi kısaca tanıtın. Kaç yıllık deneyim, uzmanlık alanları, hedefler..."
              rows={2}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">İş deneyimi</label>
            <textarea
              value={deneyim}
              onChange={(e) => setDeneyim(e.target.value)}
              placeholder="Şirket adı, pozisyon, tarih aralığı, yaptığınız işler (madde madde)"
              rows={4}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Eğitim</label>
            <textarea
              value={egitim}
              onChange={(e) => setEgitim(e.target.value)}
              placeholder="Okul adı, bölüm, mezuniyet yılı, varsa not ortalaması"
              rows={3}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Beceriler</label>
            <input
              type="text"
              value={beceriler}
              onChange={(e) => setBeceriler(e.target.value)}
              placeholder="Örn: JavaScript, React, Excel, Proje Yönetimi (virgülle ayırın)"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Diller</label>
            <input
              type="text"
              value={dil}
              onChange={(e) => setDil(e.target.value)}
              placeholder="Örn: Türkçe (Ana dil), İngilizce (B2), Almanca (A2)"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <button
            type="submit"
            disabled={yukleniyor || authLoading}
            className="w-full rounded-xl bg-brand-600 py-4 font-semibold text-white shadow-[0_4px_14px_-2px_rgba(5,150,105,.4)] transition hover:bg-brand-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {yukleniyor ? "CV taslağı oluşturuluyor…" : "CV taslağını oluştur"}
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
          title="CV taslağı"
          copyLabel="Kopyala"
          blurred={showBlurred && !limitReached}
          limitReached={limitReached}
          showPrint={!!sonuc}
          onPrint={handlePrint}
        />
      )}
      {showResult && sonuc && (
        <p className="mt-4 text-sm text-slate-500 no-print">
          Taslağı Word, Canva veya LinkedIn&apos;e yapıştırarak düzenleyebilirsiniz. Bilgilerinizi kontrol etmeyi unutmayın.
        </p>
      )}
    </div>
  );
}
