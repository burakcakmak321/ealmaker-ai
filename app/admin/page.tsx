"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type UserRow = { id: string; email: string | undefined; created_at: string; is_pro?: boolean };

export default function AdminPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [settingPro, setSettingPro] = useState<string | null>(null);
  const [migrating, setMigrating] = useState(false);
  const [migrateMsg, setMigrateMsg] = useState("");

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

  async function handleSetPro(userId?: string) {
    setSettingPro(userId ?? "self");
    try {
      const res = await fetch("/api/admin/set-pro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userId ? { userId } : {}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Hata");
      if (userId) {
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, is_pro: true } : u)));
      } else {
        const list = await fetch("/api/admin/users").then((r) => r.json());
        if (list.users) setUsers(list.users);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Pro verilemedi.");
    } finally {
      setSettingPro(null);
    }
  }

  async function handleMigrate() {
    setMigrating(true);
    setMigrateMsg("");
    try {
      const res = await fetch("/api/admin/migrate", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        const parts = [data.error || "Hata"];
        if (data.instructions?.length) parts.push(...data.instructions);
        if (data.sql) parts.push("SQL: " + data.sql);
        setMigrateMsg(parts.join("\n"));
        return;
      }
      setMigrateMsg(data.message || "Migration tamamlandı.");
    } catch (err) {
      setMigrateMsg(err instanceof Error ? err.message : "Bağlantı hatası.");
    } finally {
      setMigrating(false);
    }
  }

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
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-slate-600">
          Telefondan veya bilgisayardan kayıt olan tüm kullanıcılar burada listelenir.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleMigrate}
            disabled={migrating}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            {migrating ? "…" : "🔄 one_time_credits migration"}
          </button>
          <button
            type="button"
            onClick={() => handleSetPro()}
            disabled={!!settingPro}
            className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
          >
            {settingPro === "self" ? "…" : "✨ Hesabımı Pro yap"}
          </button>
        </div>
      </div>
      {migrateMsg && (
        <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 whitespace-pre-line">
          {migrateMsg}
        </div>
      )}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[400px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 font-semibold text-slate-700">#</th>
                <th className="px-4 py-3 font-semibold text-slate-700">E-posta</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Kayıt tarihi</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Pro</th>
                <th className="px-4 py-3 font-semibold text-slate-700">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
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
                    <td className="px-4 py-3">
                      {u.is_pro ? (
                        <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700">Pro</span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {!u.is_pro && (
                        <button
                          type="button"
                          onClick={() => handleSetPro(u.id)}
                          disabled={!!settingPro}
                          className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
                        >
                          {settingPro === u.id ? "…" : "Pro ver"}
                        </button>
                      )}
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
