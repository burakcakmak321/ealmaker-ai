"use client";

import { useRef, useState } from "react";
import { incrementUsage } from "@/lib/usage";
import { CopyButton } from "@/components/CopyButton";
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
  const [baslik, setBaslik] = useState("");
  const [konu, setKonu] = useState("");
  const [detay, setDetay] = useState("");
  const [sonuc, setSonuc] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState("");
  const printRef = useRef<HTMLDivElement>(null);

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
          type: "dilekce",
          baslik: baslik || "Dilekçe",
          konu: konu || "",
          detay,
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

  function handlePrint() {
    window.print();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <PageHeader
        title="Dilekçe Sihirbazı"
        description="Konuyu kısaca anlatın; resmi dilekçe formatında metin hazırlayalım. Yazdırıp imzalayıp gönderebilirsiniz."
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
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Dilekçe türü / başlık
            </label>
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
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Konu (kısa)
            </label>
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
            disabled={yukleniyor}
            className="w-full rounded-xl bg-brand-600 py-4 font-semibold text-white shadow-soft transition hover:bg-brand-700 disabled:opacity-60"
          >
            {yukleniyor ? "Dilekçe yazılıyor…" : "Dilekçe metnini oluştur"}
          </button>
        </form>
      </div>

      {hata && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {hata}
        </div>
      )}

      {sonuc && (
        <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-card sm:p-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 no-print">
            <h2 className="text-lg font-semibold text-slate-800">Dilekçe metni</h2>
            <div className="flex flex-wrap gap-2">
              <CopyButton text={sonuc} label="Kopyala" />
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
              >
                🖨️ Yazdır / PDF kaydet
              </button>
            </div>
          </div>
          <div
            ref={printRef}
            className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-6 print:border-0 print:bg-white print:p-0"
          >
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-800">
              {sonuc}
            </pre>
          </div>
          <p className="mt-4 text-sm text-slate-500 no-print">
            &quot;Yazdır / PDF kaydet&quot; ile tarayıcıdan PDF olarak kaydedebilir veya
            doğrudan yazdırabilirsiniz. İmza ve tarih eklemeyi unutmayın.
          </p>
        </div>
      )}
    </div>
  );
}
