"use client";

import { useToast } from "./Toast";

export function CopyButton({ text, label = "Kopyala" }: { text: string; label?: string }) {
  const toast = useToast();

  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => toast.show("Panoya kopyalandı!"));
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-card transition hover:bg-slate-50 hover:border-slate-300"
    >
      <span aria-hidden>📋</span>
      {label}
    </button>
  );
}
