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

export default function DilekcePage() {
  const { user, loading: authLoading } = useAuth();
  const [baslik, setBaslik] = useState("");
  const [konu, setKonu] = useState("");
  const [detay, setDetay] = useState("");
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
          type: "dilekce",
          baslik: baslik || "Resmi Yazı",
          konu: konu || "",
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

  function handlePrint() {
    window.print();
  }

  const showResult = showBlurred || limitReached || sonuc;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <PageHeader
        title="Resmi Yazı Taslağı"
        description="Konuyu kısaca anlatın; kurumlara hitaben resmi yazı formatında metin taslağı hazırlayalım. Taslak niteliğindedir; yazdırıp imzalayıp göndermeden önce mutlaka kontrol edin."
        icon="📋"
      />

      <Disclaimer />

      <div className="mb-8 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-6">
        <p className="mb-3 text-sm font-semibold text-slate-700">Hızlı şablon seçin</p>
        <div className="flex flex-wrap gap-2">
          {["Tüketici Hakem Heyeti", "Kira artışı itirazı", "Belediye şikayeti", "Yol onarım talebi", "Ürün iadesi", "Apartman gürültü"].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setBaslik(t)}
              className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                baslik === t
                  ? "border-brand-500 bg-brand-100 text-brand-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-brand-200 hover:bg-brand-50/50"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Yazı türü / başlık</label>
            <select
              value={baslik}
              onChange={(e) => setBaslik(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="">Seçin veya yukarıdan hızlı seçin</option>
              {DILEKCE_KATEGORILERI.map((g) => (
                <optgroup key={g.grup} label={g.grup}>
                  {g.secenekler.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Konu (kısa)</label>
            <input
              type="text"
              value={konu}
              onChange={(e) => setKonu(e.target.value)}
              placeholder="Örn: Komşu gürültü şikayeti, mağaza iade talebi"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Detay</label>
            <textarea
              value={detay}
              onChange={(e) => setDetay(e.target.value)}
              placeholder="Olayı, tarihleri, talebinizi kısaca anlatın. Ne istiyorsunuz?"
              rows={4}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <button
            type="submit"
            disabled={yukleniyor || authLoading}
            className="w-full rounded-xl bg-brand-600 py-4 font-semibold text-white shadow-soft transition hover:bg-brand-700 disabled:opacity-60"
          >
            {yukleniyor ? "Metin taslağı oluşturuluyor…" : "Resmi yazı taslağını oluştur"}
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
          title="Resmi yazı taslağı"
          copyLabel="Kopyala"
          blurred={showBlurred && !limitReached}
          limitReached={limitReached}
          showPrint={!!sonuc}
          onPrint={handlePrint}
        />
      )}
      {showResult && sonuc && (
        <p className="mt-4 text-sm text-slate-500 no-print">
          &quot;Yazdır / PDF kaydet&quot; ile tarayıcıdan PDF olarak kaydedebilir veya doğrudan yazdırabilirsiniz. İmza ve tarih eklemeyi unutmayın.
        </p>
      )}
    </div>
  );
}
