"use client";

import { ETICARET_PLATFORMS, type EticaretPlatform } from "@/lib/eticaret-platforms";

type Props = {
  value: string;
  onChange: (platformId: string) => void;
  className?: string;
};

export default function PlatformSelector({ value, onChange, className = "" }: Props) {
  const selectedPlatform = ETICARET_PLATFORMS.find((p) => p.id === value);

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-medium text-slate-700">Platform Seçin</label>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {ETICARET_PLATFORMS.map((platform) => {
          const isSelected = value === platform.id;
          return (
            <button
              key={platform.id}
              type="button"
              onClick={() => onChange(platform.id)}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                isSelected
                  ? "border-brand-500 bg-brand-50 text-brand-700 shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:border-brand-200 hover:bg-brand-50/50"
              }`}
            >
              <span className="text-lg">{platform.icon}</span>
              <span className="truncate">{platform.name}</span>
            </button>
          );
        })}
      </div>
      {selectedPlatform && (
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs text-slate-500">
            <span className="font-semibold">Format:</span> {selectedPlatform.titleFormat}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            <span className="font-semibold">Başlık:</span> max {selectedPlatform.maxTitleLength} karakter
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            {selectedPlatform.tips.map((tip, i) => (
              <span key={i} className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-700">
                💡 {tip}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
