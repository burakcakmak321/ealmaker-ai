"use client";

import { useState } from "react";
import Link from "next/link";
import { CopyButton } from "@/components/CopyButton";
import RichTextEditor from "@/components/RichTextEditor";

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
  const [editMode, setEditMode] = useState(false);

  return (
    <div className="mt-10 animate-fade-in rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_4px_24px_-4px_rgba(0,0,0,.08)] sm:p-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        <div className="flex flex-wrap items-center gap-2">
          {!isBlurred && text && (
            <button
              type="button"
              onClick={() => setEditMode(!editMode)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                editMode
                  ? "bg-brand-100 text-brand-700 border border-brand-200"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {editMode ? "Basit Gorunum" : "Duzenle"}
            </button>
          )}
          {!isBlurred && !editMode && <CopyButton text={text} label={copyLabel} />}
          {!isBlurred && showPrint && onPrint && (
            <button
              type="button"
              onClick={onPrint}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
            >
              Yazdir / PDF
            </button>
          )}
        </div>
      </div>

      {editMode && !isBlurred ? (
        <RichTextEditor initialText={text} />
      ) : (
        <div className="relative rounded-xl border border-slate-200/80 bg-slate-50/80 p-5">
          {isBlurred && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-slate-900/60 backdrop-blur-md">
              <p className="px-4 text-center text-base font-semibold text-white">
                {limitReached
                  ? "Ucretsiz kullanim hakkiniz doldu. Sinirsiz kullanim icin Premium'a gecin."
                  : "Ucretsiz hakkinizi kullanmak icin oturum acmalisiniz."}
              </p>
              <Link
                href={limitReached ? "/fiyatlandirma" : "/giris"}
                className="mt-4 rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white shadow-[0_2px_8px_-2px_rgba(5,150,105,.4)] transition hover:bg-brand-700"
              >
                {limitReached ? "Premium'a gec" : "Giris yap / Kayit ol"}
              </Link>
            </div>
          )}
          <pre
            className={`whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-800 ${isBlurred ? "select-none blur-md" : ""}`}
          >
            {displayText}
          </pre>
        </div>
      )}
    </div>
  );
}
