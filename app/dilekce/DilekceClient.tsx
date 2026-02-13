"use client";

import { useRef, useState } from "react";
import { useAuth } from "@/components/AuthGuard";
import ResultWithBlur from "@/components/ResultWithBlur";
import PageHeader from "@/components/PageHeader";
import Disclaimer from "@/components/Disclaimer";

const DILEKCE_KATEGORILERI = [
  { grup: "Belediye & Kamu", secenekler: ["Yol onarım talebi", "Çöp toplama şikayeti", "Park / yeşil alan talebi", "İmar / ruhsat talebi", "Belediye genel şikayet"] },
  { grup: "Tüketici Hakları", secenekler: ["Tüketici Hakem Heyeti başvurusu", "Ürün iadesi talebi", "Cayma hakkı kullanımı", "Garanti / ayıplı mal şikayeti"] },
  { grup: "Kira & Taşınmaz", secenekler: ["Kira artışı itirazı", "Depozito iadesi talebi", "Tahliye talebi", "Sözleşme feshi"] },
  { grup: "Mahkeme & Hukuk", secenekler: ["Boşanma / velayet", "Nafaka talebi", "İcra itirazı", "Tazminat talebi"] },
  { grup: "Eğitim", secenekler: ["Okul kayıt / nakil", "Burs başvurusu", "Mazeret dilekçesi", "Belge talebi"] },
  { grup: "Diğer", secenekler: ["Apartman gürültü şikayeti", "Resmi kurum şikayeti", "Özel dilekçe (aşağıda yazın)"] },
];

export default function DilekceClient() {
  const { user, loading: authLoading } = useAuth();
  const [baslik, setBaslik] = useState("");
  const [konu, setKonu] = useState("");
  const [detay, setDetay] = useState("");
  const [sonuc, setSonuc] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState("");
  const [showBlurred, setShowBlurred] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const detayRef = useRef<HTMLTextAreaElement>(null);

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
          type: "dilekce",
          kurum: baslik || "ilgili kurum",
          konu: konu || "dilekçe",
          detay,
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
        title="AI Destekli Dilekçe"
        description="Belediye, okul, kurum ve resmi başvurular için AI destekli dilekçe taslağı. Türkiye standartlarına uygun, profesyonel metinler."
        icon="📝"
      />

      <Disclaimer />

      <div className="mb-8 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-6 shadow-[0_1px_3px_rgba(0,0,0,.04)]">
        <p className="mb-3 text-sm font-semibold text-slate-700">Hazır kategori</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {DILEKCE_KATEGORILERI.map((kat) => (
            <div key={kat.grup} className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-xs font-semibold text-slate-500">{kat.grup}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {kat.secenekler.map((secenek) => (
                  <button
                    key={secenek}
                    type="button"
                    onClick={() => {
                      setKonu(secenek);
                      detayRef.current?.focus();
                    }}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 transition hover:border-brand-200 hover:bg-brand-50/50"
                  >
                    {secenek}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_4px_24px_-4px_rgba(0,0,0,.08)] sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Kurum adı</label>
            <input
              type="text"
              value={baslik}
              onChange={(e) => setBaslik(e.target.value)}
              placeholder="Örn: Çorlu Belediyesi, X Üniversitesi"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Konu</label>
            <input
              type="text"
              value={konu}
              onChange={(e) => setKonu(e.target.value)}
              placeholder="Örn: Burs başvurusu, Yol onarım talebi"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Detay <span className="text-slate-400">(isteğe bağlı)</span>
            </label>
            <textarea
              ref={detayRef}
              value={detay}
              onChange={(e) => setDetay(e.target.value)}
              placeholder="Tarih, başvuru no, açıklama, talep vb."
              rows={4}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <button
            type="submit"
            disabled={yukleniyor || authLoading}
            className="w-full rounded-xl bg-brand-600 py-4 font-semibold text-white shadow-soft transition hover:bg-brand-700 disabled:opacity-60"
          >
            {yukleniyor ? "Metin yazılıyor…" : "Dilekçe oluştur"}
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
          title="Oluşan metin"
          copyLabel="Kopyala"
          blurred={showBlurred && !limitReached}
          limitReached={limitReached}
        />
      )}
    </div>
  );
}