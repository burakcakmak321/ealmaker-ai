"use client";

import { useState } from "react";
import Link from "next/link";
import { BUSINESS } from "@/lib/brand";

export default function IletisimPage() {
  const [gonderildi, setGonderildi] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const ad = (form.elements.namedItem("ad") as HTMLInputElement)?.value || "";
    const email = (form.elements.namedItem("email") as HTMLInputElement)?.value || "";
    const konu = (form.elements.namedItem("konu") as HTMLSelectElement)?.value || "";
    const mesaj = (form.elements.namedItem("mesaj") as HTMLTextAreaElement)?.value || "";

  const konuLabel = { genel: "Genel soru", pro: "Premium / Fiyatlandırma", kurumsal: "Kurumsal teklif", teknik: "Teknik destek", kvkk: "KVKK başvurusu / Veri talebi", iade: "İade / İptal", odeme: "Ödeme / Faturalandırma" }[konu] || konu;
    const subject = `[YazıAsistan İletişim] ${konuLabel}`;
    const body = `Ad Soyad: ${ad}\nE-posta: ${email}\nKonu: ${konuLabel}\n\nMesaj:\n${mesaj}`;

    const mailto = `mailto:${BUSINESS.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
    setGonderildi(true);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:py-24">
      <Link href="/" className="mb-8 inline-block text-sm text-slate-600 hover:text-brand-600">
        ← Ana sayfa
      </Link>
      <h1 className="mb-4 text-3xl font-bold text-slate-900">İletişim</h1>
      <p className="mb-6 text-slate-600">
        Soru, öneri, KVKK başvurusu veya kurumsal teklif için aşağıdaki formu kullanabilirsiniz. Talepleriniz en kısa sürede değerlendirilecektir.
      </p>

      <div className="mb-10 rounded-xl border border-slate-200 bg-slate-50 p-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">İşletme Bilgileri</h2>
        <p className="font-medium text-slate-800">{BUSINESS.unvan}</p>
        <p className="mt-1 text-sm text-slate-600">{BUSINESS.adres}</p>
        <p className="mt-1 text-sm text-slate-600">Vergi Dairesi: {BUSINESS.vergiDairesi}</p>
        <p className="mt-1 text-sm text-slate-600">VKN: {BUSINESS.vkn}</p>
        <p className="mt-2 flex items-center gap-2 text-sm">
          <span>📞</span> <a href={`tel:${BUSINESS.telefon.replace(/\s/g, "")}`} className="text-brand-600 hover:underline">{BUSINESS.telefon}</a>
        </p>
        <p className="mt-1 flex items-center gap-2 text-sm">
          <span>✉️</span> <a href={`mailto:${BUSINESS.email}`} className="text-brand-600 hover:underline">{BUSINESS.email}</a>
        </p>
        <p className="mt-3 text-xs text-slate-500">Destek: Hafta içi 09:00–18:00 · KVKK başvuruları 30 gün içinde yanıtlanır</p>
        <p className="mt-2 text-xs text-slate-500">İade/iptal talepleri: 5 iş günü içinde değerlendirilir.</p>
      </div>

      {gonderildi ? (
        <div className="rounded-2xl border border-brand-200 bg-brand-50 p-8 text-center">
          <p className="mb-2 font-semibold text-brand-800">E-posta istemciniz açıldı.</p>
          <p className="text-sm text-slate-600">
            Mesajınızı gönderin. KVKK başvuruları 30 gün içinde yanıtlanacaktır.
          </p>
          <p className="mt-4 text-xs text-slate-500">
            E-posta açılmadıysa: <a href={`mailto:${BUSINESS.email}`} className="font-medium text-brand-600 underline">{BUSINESS.email}</a> adresine yazabilirsiniz.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="ad" className="mb-1 block text-sm font-medium text-slate-700">
              Ad Soyad
            </label>
            <input
              id="ad"
              type="text"
              name="ad"
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              placeholder="Adınız soyadınız"
            />
          </div>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
              E-posta
            </label>
            <input
              id="email"
              type="email"
              name="email"
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              placeholder="ornek@email.com"
            />
          </div>
          <div>
            <label htmlFor="konu" className="mb-1 block text-sm font-medium text-slate-700">
              Konu
            </label>
            <select
              id="konu"
              name="konu"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="genel">Genel soru</option>
              <option value="pro">Premium / Fiyatlandırma</option>
              <option value="kurumsal">Kurumsal teklif</option>
              <option value="teknik">Teknik destek</option>
              <option value="kvkk">KVKK başvurusu / Veri talebi</option>
              <option value="iade">İade / İptal</option>
              <option value="odeme">Ödeme / Faturalandırma</option>
            </select>
          </div>
          <div>
            <label htmlFor="mesaj" className="mb-1 block text-sm font-medium text-slate-700">
              Mesajınız
            </label>
            <textarea
              id="mesaj"
              name="mesaj"
              required
              rows={5}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              placeholder="Mesajınızı yazın..."
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-brand-600 py-4 font-semibold text-white transition hover:bg-brand-700"
          >
            Gönder
          </button>
        </form>
      )}
    </div>
  );
}
