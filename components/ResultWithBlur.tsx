"use client";

import Link from "next/link";
import { CopyButton } from "@/components/CopyButton";

const PLACEHOLDER_BLUR =
  "Sayın Yetkili,\n\nKonu hakkında yazılmış örnek metin burada görünecektir. Ücretsiz hakkınızı kullanmak için giriş yapın veya kayıt olun.\n\nSaygılarımızla.";

type Props = {
  text: string;
  title?: string;
  copyLabel?: string;
  blurred?: boolean;
  limitReached?: boolean;
  showPrint?: boolean;
  onPrint?: () => void;
};

export default function ResultWithBlur({
  text,
  title = "Sonuç",
  copyLabel = "Kopyala",
  blurred,
  limitReached,
  showPrint,
  onPrint,
}: Props) {
  const displayText = text || PLACEHOLDER_BLUR;
  const isBlurred = blurred || limitReached;

  return (
    <div className="mt-10 animate-fade-in rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card sm:p-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        {!isBlurred && <CopyButton text={text} label={copyLabel} />}
        {!isBlurred && showPrint && onPrint && (
          <button
            type="button"
            onClick={onPrint}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
          >
            🖨️ Yazdır / PDF kaydet
          </button>
        )}
      </div>
      <div className="relative rounded-xl border border-slate-200/80 bg-slate-50/80 p-5">
        {isBlurred && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-slate-900/60 backdrop-blur-md">
            <p className="px-4 text-center text-base font-semibold text-white">
              {limitReached
                ? "Ücretsiz kullanım hakkınız doldu. Sınırsız kullanım için Premium'a geçin."
                : "Ücretsiz hakkınızı kullanmak için oturum açmalısınız."}
            </p>
            <Link
              href={limitReached ? "/premium-yakinda" : "/giris"}
              className="mt-4 rounded-xl bg-brand-600 px-5 py-2.5 font-semibold text-white transition hover:bg-brand-700"
            >
              {limitReached ? "Premium'a geç" : "Giriş yap / Kayıt ol"}
            </Link>
          </div>
        )}
        <pre
          className={`whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-800 ${isBlurred ? "select-none blur-md" : ""}`}
        >
          {displayText}
        </pre>
      </div>
    </div>
  );
}
