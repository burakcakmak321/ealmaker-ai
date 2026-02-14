"use client";

import { TONE_PRESETS, type TonePreset } from "@/lib/tone-presets";

type Props = {
  value: TonePreset;
  onChange: (tone: TonePreset) => void;
  className?: string;
};

export default function ToneSelector({ value, onChange, className = "" }: Props) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-slate-700">Dil Tonu</label>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(TONE_PRESETS) as TonePreset[]).map((key) => {
          const preset = TONE_PRESETS[key];
          const isSelected = value === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                isSelected
                  ? "border-brand-500 bg-brand-50 text-brand-700 shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:border-brand-200 hover:bg-brand-50/50"
              }`}
            >
              <span>{preset.icon}</span>
              <span>{preset.label}</span>
            </button>
          );
        })}
      </div>
      <p className="text-xs text-slate-500">{TONE_PRESETS[value].example}</p>
    </div>
  );
}
