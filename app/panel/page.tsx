"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthGuard";
import { CopyButton } from "@/components/CopyButton";

type Generation = {
  id: string;
  module: string;
  moduleLabel: string;
  title: string | null;
  inputPreview: string | null;
  outputText: string;
  createdAt: string;
};

export default function PanelPage() {
  const { user, loading: authLoading } = useAuth();
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    fetch("/api/user/generations?limit=50")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setGenerations(data.generations ?? []);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Yüklenemedi."))
      .finally(() => setLoading(false));
  }, [user]);

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch("/api/user/generations/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Silinemedi.");
      setGenerations((prev) => prev.filter((g) => g.id !== id));
      if (expandedId === id) setExpandedId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setDeletingId(null);
    }
  }

  if (authLoading || (user && loading)) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-slate-600">Yükleniyor…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-800">
          <p className="font-medium">Oturum açmanız gerekiyor.</p>
          <p className="mt-2 text-sm">Geçmiş projelerinizi görmek için giriş yapın.</p>
          <Link
            href="/giris"
            className="mt-4 inline-block rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white transition hover:bg-brand-700"
          >
            Giriş Yap
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Projelerim</h1>
          <p className="mt-1 text-sm text-slate-600">
            Oluşturduğunuz metinler burada saklanır. İstediğiniz zaman tekrar görüntüleyip kopyalayabilirsiniz.
          </p>
        </div>
        <Link
          href="/"
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          ← Ana sayfaya dön
        </Link>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-medium">{error}</p>
          {error.includes("supabase-admin-extended") && (
            <p className="mt-2 text-xs">
              Supabase Dashboard → SQL Editor → <code className="rounded bg-amber-100 px-1">supabase-admin-extended.sql</code> dosyasının içeriğini yapıştırıp çalıştırın.
            </p>
          )}
        </div>
      )}

      {generations.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-12 text-center">
          <p className="text-slate-600">Henüz kaydedilmiş proje yok.</p>
          <p className="mt-2 text-sm text-slate-500">
            Dilekçe, fatura itirazı, CV veya diğer araçlarla metin oluşturduğunuzda burada görünecektir.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white transition hover:bg-brand-700"
          >
            Araçları keşfet
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {generations.map((g) => (
            <div
              key={g.id}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,.06)] transition hover:shadow-md"
            >
              <button
                type="button"
                onClick={() => setExpandedId(expandedId === g.id ? null : g.id)}
                className="flex w-full items-center justify-between gap-4 p-4 text-left"
              >
                <div className="min-w-0 flex-1">
                  <span className="rounded bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700">
                    {g.moduleLabel}
                  </span>
                  <p className="mt-1 truncate font-medium text-slate-900">
                    {g.title || g.inputPreview || "Proje"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(g.createdAt).toLocaleString("tr-TR", { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                </div>
                <span className="shrink-0 text-slate-400">
                  {expandedId === g.id ? "▲" : "▼"}
                </span>
              </button>

              {expandedId === g.id && (
                <div className="border-t border-slate-100 bg-slate-50/60 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">Oluşturulan metin</span>
                    <div className="flex gap-2">
                      <CopyButton text={g.outputText} label="Kopyala" />
                      <button
                        type="button"
                        onClick={() => handleDelete(g.id)}
                        disabled={!!deletingId}
                        className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                      >
                        {deletingId === g.id ? "…" : "Sil"}
                      </button>
                    </div>
                  </div>
                  <pre className="max-h-64 overflow-auto rounded-lg border border-slate-200 bg-white p-4 text-sm leading-relaxed text-slate-800 whitespace-pre-wrap font-sans">
                    {g.outputText}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
