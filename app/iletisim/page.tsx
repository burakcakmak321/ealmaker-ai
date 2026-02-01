"use client";

import { useState } from "react";
import Link from "next/link";

export default function IletisimPage() {
  const [gonderildi, setGonderildi] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Backend olmadan sadece "gönderildi" mesajı göster
    setGonderildi(true);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:py-24">
      <Link href="/" className="mb-8 inline-block text-sm text-slate-600 hover:text-brand-600">
        ← Ana sayfa
      </Link>
      <h1 className="mb-4 text-3xl font-bold text-slate-900">İletişim</h1>
      <p className="mb-10 text-slate-600">
        Soru, öneri veya kurumsal teklif için aşağıdaki formu kullanabilirsiniz. Backend
        eklendiğinde mesajlarınız iletilecektir.
      </p>

      {gonderildi ? (
        <div className="rounded-2xl border border-brand-200 bg-brand-50 p-8 text-center">
          <p className="mb-2 font-semibold text-brand-800">Mesajınız alındı.</p>
          <p className="text-sm text-slate-600">
            Ödeme ve backend entegrasyonu tamamlandığında gerçek iletişim aktif olacaktır.
            Şimdilik bu bir demo yanıtıdır.
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
              <option value="pro">Pro / Fiyatlandırma</option>
              <option value="kurumsal">Kurumsal teklif</option>
              <option value="teknik">Teknik destek</option>
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
