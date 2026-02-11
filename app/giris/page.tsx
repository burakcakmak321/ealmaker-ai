"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function GirisForm() {
  const [ad, setAd] = useState("");
  const [soyad, setSoyad] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      const endpoint = isSignUp ? "/api/auth/signup" : "/api/auth/login";
      const body: Record<string, string> = { email, password };
      if (isSignUp) {
        body.firstName = ad.trim();
        body.lastName = soyad.trim();
      } else {
        body.next = next;
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "same-origin",
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "err", text: data.error || "Bir hata oluştu." });
        return;
      }

      if (isSignUp) {
        setMessage({ type: "ok", text: data.message || "Kayıt başarılı. Giriş yapabilirsiniz." });
      } else {
        window.location.href = data.redirect || next;
      }
    } catch (err: unknown) {
      const text =
        err instanceof Error && (err.message === "Failed to fetch" || err.message.includes("fetch"))
          ? "Bağlantı hatası. İnternet bağlantınızı kontrol edin."
          : "Bir hata oluştu.";
      setMessage({ type: "err", text });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:py-24">
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_-12px_rgba(0,0,0,.12)] sm:p-8">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-lg font-bold text-slate-900">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-white">⚖️</span>
            YazıAsistan
          </Link>
          <h1 className="mt-6 text-xl font-bold text-slate-900">
            {isSignUp ? "Hesap oluştur" : "Giriş yap"}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            {isSignUp
              ? "Günlük 3 ücretsiz kullanım hakkınızı açmak için kayıt olun."
              : "Ücretsiz haklarınızı kullanmak için giriş yapın."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {isSignUp && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Ad</label>
                  <input
                    type="text"
                    value={ad}
                    onChange={(e) => setAd(e.target.value)}
                    required={isSignUp}
                    placeholder="Adınız"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Soyad</label>
                  <input
                    type="text"
                    value={soyad}
                    onChange={(e) => setSoyad(e.target.value)}
                    required={isSignUp}
                    placeholder="Soyadınız"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>
            </>
          )}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">E-posta</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="ornek@email.com"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Şifre</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
            {isSignUp && (
              <p className="mt-1 text-xs text-slate-500">En az 6 karakter</p>
            )}
          </div>
          {message && (
            <div
              className={`rounded-xl border p-3 text-sm ${
                message.type === "ok"
                  ? "border-green-200 bg-green-50 text-green-800"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {message.text}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-brand-600 py-3.5 font-semibold text-white shadow-soft transition hover:bg-brand-700 disabled:opacity-60"
          >
            {loading ? "İşleniyor…" : isSignUp ? "Kayıt ol" : "Giriş yap"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          {isSignUp ? "Zaten hesabınız var mı? " : "Hesabınız yok mu? "}
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setMessage(null);
            }}
            className="font-semibold text-brand-600 hover:underline"
          >
            {isSignUp ? "Giriş yap" : "Kayıt ol"}
          </button>
        </p>
      </div>
      <p className="mt-6 text-center">
        <Link href="/" className="text-sm text-slate-500 hover:text-slate-700">
          ← Ana sayfaya dön
        </Link>
      </p>
    </div>
  );
}

export default function GirisPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-md px-4 py-16 text-center text-slate-600">Yükleniyor…</div>}>
      <GirisForm />
    </Suspense>
  );
}
