"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

const STORAGE_KEY = "yaziasistan_cookie_consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(STORAGE_KEY);
    if (!consent) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 px-4 py-4 shadow-[0_-4px_24px_-4px_rgba(0,0,0,.1)] backdrop-blur-xl sm:px-6"
      role="dialog"
      aria-label="Çerez bildirimi"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-600">
          Sitemizde deneyiminizi iyileştirmek için çerezler kullanıyoruz. Sitede gezinmeye devam ederek{" "}
          <Link href="/cerezler" className="font-semibold text-brand-600 hover:underline">
            Çerez Politikamızı
          </Link>{" "}
          ve{" "}
          <Link href="/gizlilik" className="font-semibold text-brand-600 hover:underline">
            Gizlilik Politikamızı
          </Link>{" "}
          kabul etmiş olursunuz.
        </p>
        <button
          onClick={accept}
          className="shrink-0 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          Anladım, kabul ediyorum
        </button>
      </div>
    </div>
  );
}
