"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";

function GirisForm() {
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
    const supabase = createClient();
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined,
          },
        });
        if (error) throw error;
        setMessage({ type: "ok", text: "Kayıt başarılı. E-posta doğrulama linki gönderildi (gerekirse spam klasörüne bakın). Giriş yapabilirsiniz." });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push(next);
        router.refresh();
        return;
      }
    } catch (err: unknown) {
      let text = "Bir hata oluştu.";
      if (err instanceof Error) {
        text = err.message;
        if (text === "Failed to fetch" || text.includes("fetch")) {
          text = "Bağlantı hatası. İnternet bağlantınızı kontrol edin, reklam engelleyiciyi kapatıp tekrar deneyin.";
        }
      }
      setMessage({ type: "err", text });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:py-24">
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card sm:p-8">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-lg font-bold text-slate-900">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-white">⚖️</span>
            DealMaker AI
          </Link>
          <h1 className="mt-6 text-xl font-bold text-slate-900">
            {isSignUp ? "Hesap oluştur" : "Giriş yap"}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            {isSignUp
              ? "2 ücretsiz kullanım hakkınızı açmak için kayıt olun."
              : "Ücretsiz haklarınızı kullanmak için giriş yapın."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
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
