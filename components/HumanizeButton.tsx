"use client";

import { useState } from "react";
import { TRANSFORMATION_TYPES, type TransformationType } from "@/lib/tone-presets";

type Props = {
  text: string;
  onTransformed: (newText: string, mode: "replace" | "alternative") => void;
  disabled?: boolean;
};

export default function HumanizeButton({ text, onTransformed, disabled }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<TransformationType | null>(null);

  async function handleTransform(type: TransformationType, mode: "replace" | "alternative") {
    if (!text || loading) return;
    setLoading(true);
    setSelectedType(type);
    try {
      const res = await fetch("/api/humanize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, transformationType: type }),
      });
      const data = await res.json();
      if (res.ok && data.text) {
        onTransformed(data.text, mode);
      }
    } catch {
    } finally {
      setLoading(false);
      setSelectedType(null);
      setIsOpen(false);
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled || !text}
        className="inline-flex items-center gap-2 rounded-lg bg-amber-100 px-4 py-2 text-sm font-medium text-amber-800 transition hover:bg-amber-200 disabled:opacity-50"
      >
        <span>🔄</span>
        <span>Dönüştür</span>
        <span className="text-xs">▼</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Metni Dönüştür
            </p>
            <div className="space-y-2">
              {(Object.keys(TRANSFORMATION_TYPES) as TransformationType[]).map((key) => {
                const type = TRANSFORMATION_TYPES[key];
                const isLoading = loading && selectedType === key;
                return (
                  <div key={key} className="rounded-lg border border-slate-100 bg-slate-50/50 p-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{type.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800">{type.label}</p>
                        <p className="text-xs text-slate-500">{type.description}</p>
                      </div>
                    </div>
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleTransform(key, "replace")}
                        disabled={loading}
                        className="flex-1 rounded-lg bg-brand-600 px-2 py-1.5 text-xs font-medium text-white transition hover:bg-brand-700 disabled:opacity-50"
                      >
                        {isLoading ? "..." : "Değiştir"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTransform(key, "alternative")}
                        disabled={loading}
                        className="flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                      >
                        {isLoading ? "..." : "Alternatif"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
