"use client";

import { useState, useRef, useCallback } from "react";
import { CopyButton } from "@/components/CopyButton";

type Props = {
  initialText: string;
  onUpdate?: (text: string) => void;
};

export default function RichTextEditor({ initialText, onUpdate }: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);

  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  }, []);

  function handleExport(format: "text" | "html") {
    if (!editorRef.current) return;
    const content = format === "html" ? editorRef.current.innerHTML : editorRef.current.innerText;
    navigator.clipboard.writeText(content);
  }

  function getPlainText() {
    return editorRef.current?.innerText || initialText;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">Metin Editoru</h3>
        <button
          type="button"
          onClick={() => setIsEditing(!isEditing)}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
            isEditing
              ? "bg-brand-100 text-brand-700"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          {isEditing ? "Duzenle (Aktif)" : "Duzenle"}
        </button>
      </div>

      {isEditing && (
        <div className="flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-slate-50 p-2">
          <button type="button" onClick={() => execCommand("bold")} className="rounded-lg px-3 py-1.5 text-sm font-bold text-slate-700 transition hover:bg-slate-200" title="Kalin">
            B
          </button>
          <button type="button" onClick={() => execCommand("italic")} className="rounded-lg px-3 py-1.5 text-sm italic text-slate-700 transition hover:bg-slate-200" title="Italik">
            I
          </button>
          <button type="button" onClick={() => execCommand("underline")} className="rounded-lg px-3 py-1.5 text-sm underline text-slate-700 transition hover:bg-slate-200" title="Alti cizili">
            U
          </button>
          <div className="mx-1 w-px bg-slate-300" />
          <button type="button" onClick={() => execCommand("formatBlock", "h2")} className="rounded-lg px-3 py-1.5 text-sm font-bold text-slate-700 transition hover:bg-slate-200" title="Baslik">
            H2
          </button>
          <button type="button" onClick={() => execCommand("formatBlock", "h3")} className="rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200" title="Alt baslik">
            H3
          </button>
          <button type="button" onClick={() => execCommand("formatBlock", "p")} className="rounded-lg px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-200" title="Paragraf">
            P
          </button>
          <div className="mx-1 w-px bg-slate-300" />
          <button type="button" onClick={() => execCommand("insertUnorderedList")} className="rounded-lg px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-200" title="Madde listesi">
            • Liste
          </button>
          <button type="button" onClick={() => execCommand("insertOrderedList")} className="rounded-lg px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-200" title="Numarali liste">
            1. Liste
          </button>
          <div className="mx-1 w-px bg-slate-300" />
          <button type="button" onClick={() => execCommand("justifyLeft")} className="rounded-lg px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-200" title="Sola yasla">
            Sola
          </button>
          <button type="button" onClick={() => execCommand("justifyCenter")} className="rounded-lg px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-200" title="Ortala">
            Orta
          </button>
        </div>
      )}

      <div
        ref={editorRef}
        contentEditable={isEditing}
        suppressContentEditableWarning
        className={`min-h-[200px] rounded-xl border p-5 text-sm leading-relaxed transition ${
          isEditing
            ? "border-brand-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            : "border-slate-200 bg-slate-50/80 text-slate-800"
        }`}
        dangerouslySetInnerHTML={{ __html: initialText.replace(/\n/g, "<br>") }}
        onInput={() => onUpdate?.(getPlainText())}
      />

      <div className="flex flex-wrap gap-2">
        <CopyButton text={getPlainText()} label="Metin Kopyala" />
        <button
          type="button"
          onClick={() => handleExport("html")}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          HTML Kopyala
        </button>
      </div>
    </div>
  );
}
