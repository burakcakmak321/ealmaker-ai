"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function AuthNav() {
  const [user, setUser] = useState<{ id: string; email?: string; name?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  function fetchUser() {
    return fetch("/api/auth/me", { credentials: "same-origin" })
      .then((r) => r.json())
      .then((data) => {
        setUser(data.user ?? null);
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchUser();
  }, []);

  async function handleSignOut() {
    await fetch("/api/auth/signout", { method: "POST", credentials: "same-origin" });
    window.location.href = "/";
  }

  if (loading) return null;

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <span className="max-w-[140px] truncate text-sm text-slate-600 sm:max-w-[200px]" title={user.email}>
          {user.name || user.email}
        </span>
        <button
          type="button"
          onClick={handleSignOut}
          className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-brand-50/80 hover:text-brand-700"
        >
          Çıkış
        </button>
      </div>
    );
  }

  return (
    <Link
      href="/giris"
      className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_2px_8px_-2px_rgba(5,150,105,.4)] transition hover:bg-brand-700"
    >
      Giriş / Kayıt
    </Link>
  );
}
