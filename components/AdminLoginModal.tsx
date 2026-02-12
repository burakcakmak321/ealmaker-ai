"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

type Props = {
  onClose: () => void;
};

export default function AdminLoginModal({ onClose }: Props) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setLoading(true);
      try {
        const res = await fetch("/api/admin/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
          credentials: "same-origin",
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Giriş başarısız.");
          setLoading(false);
          return;
        }
        onClose();
        router.push("/admin");
      } catch {
        setError("Bağlantı hatası.");
      } finally {
        setLoading(false);
      }
    },
    [onClose, router, password]
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-login-title"
    >
      <div
        className="absolute inset-0"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <h2 id="admin-login-title" className="text-lg font-bold text-slate-900">
          Admin Girişi
        </h2>
        <p className="mt-1 text-sm text-slate-600">Şifreyi girin</p>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Şifre"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            autoFocus
            autoComplete="current-password"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
            >
              {loading ? "…" : "Giriş"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
