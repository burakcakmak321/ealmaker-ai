"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type UserRow = { id: string; email: string | undefined; created_at: string };

export default function AdminPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/users")
      .then((res) => {
        if (res.status === 403) throw new Error("Bu sayfayı görüntüleme yetkiniz yok.");
        return res.json();
      })
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setUsers(data.users ?? []);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Bir hata oluştu."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <p className="text-slate-600">Yükleniyor…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          {error}
        </div>
        <p className="mt-4">
          <Link href="/" className="text-brand-600 hover:underline">
            Ana sayfaya dön
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Admin — Kayıtlı kullanıcılar</h1>
        <Link
          href="/"
          className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
        >
          ← Siteye dön
        </Link>
      </div>
      <p className="mb-6 text-sm text-slate-600">
        Telefondan veya bilgisayardan kayıt olan tüm kullanıcılar burada listelenir.
      </p>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[400px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 font-semibold text-slate-700">#</th>
                <th className="px-4 py-3 font-semibold text-slate-700">E-posta</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Kayıt tarihi</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-slate-500">
                    Henüz kayıtlı kullanıcı yok.
                  </td>
                </tr>
              ) : (
                users.map((u, i) => (
                  <tr key={u.id} className="border-b border-slate-100">
                    <td className="px-4 py-3 text-slate-600">{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{u.email || "—"}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {u.created_at
                        ? new Date(u.created_at).toLocaleString("tr-TR", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })
                        : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
