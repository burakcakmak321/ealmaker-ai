"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

type UserRow = {
  id: string;
  email: string | undefined;
  created_at: string;
  is_pro?: boolean;
  is_admin?: boolean;
  pro_expires_at?: string | null;
  premium_credits?: number;
};
type ModuleBreakdown = { module: string; label: string; count: number };
type Stats = {
  totalRegistrations: number;
  todayActivities: number;
  todayUniqueUsers: number;
  totalActivities: number;
  todayVisits?: number;
  moduleBreakdown?: ModuleBreakdown[];
};
type ActivityRow = { id: string; userId: string; email: string; module: string; createdAt: string };

const MODULE_LABELS: Record<string, string> = {
  fatura: "Fatura İtirazı",
  pazarlik: "Pazarlık Mesajı",
  dilekce: "Dilekçe",
  cv: "CV",
  eticaret: "E-Ticaret",
  sosyalmedya: "Sosyal Medya",
  blogseo: "Blog & SEO",
  transform_humanize: "Metin Dönüştürücü",
  transform_formal: "Metin Dönüştürücü",
  transform_simple: "Metin Dönüştürücü",
  transform_professional: "Metin Dönüştürücü",
  transform_persuasive: "Metin Dönüştürücü",
};

export default function AdminPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [activities, setActivities] = useState<ActivityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [settingPro, setSettingPro] = useState<string | null>(null);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [premiumModal, setPremiumModal] = useState<{ userId: string; email: string } | null>(null);
  const [premiumType, setPremiumType] = useState<"monthly" | "yearly" | "credits">("monthly");
  const [premiumCredits, setPremiumCredits] = useState(10);
  const [migrating, setMigrating] = useState(false);
  const [migrateMsg, setMigrateMsg] = useState("");

  const loadData = useCallback(async () => {
    try {
      const [usersRes, statsRes, activityRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/stats"),
        fetch("/api/admin/activity?limit=100"),
      ]);
      if (usersRes.status === 403 || statsRes.status === 403) {
        throw new Error("Bu sayfayı görüntüleme yetkiniz yok. ADMIN_EMAILS içindeki e-posta ile giriş yapıp /admin adresine gidin.");
      }
      const [usersData, statsData, activityData] = await Promise.all([
        usersRes.json(),
        statsRes.json(),
        activityRes.json(),
      ]);
      if (usersData.error) throw new Error(usersData.error);
      setUsers(usersData.users ?? []);
      setStats(statsData.totalRegistrations !== undefined ? statsData : null);
      setActivities(activityData.activities ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleSetPremium() {
    if (!premiumModal) return;
    setSettingPro(premiumModal.userId);
    try {
      const res = await fetch("/api/admin/set-premium", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: premiumModal.userId,
          type: premiumType,
          credits: premiumType === "credits" ? premiumCredits : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Hata");
      setPremiumModal(null);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Premium verilemedi.");
    } finally {
      setSettingPro(null);
    }
  }

  async function handleRevokePremium(userId: string) {
    setRevoking(userId);
    try {
      const res = await fetch("/api/admin/revoke-premium", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Hata");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Premium geri alınamadı.");
    } finally {
      setRevoking(null);
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
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Admin Paneli</h1>
        <div className="flex gap-2">
          <Link
            href="/"
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
          >
            ← Siteye dön
          </Link>
        </div>
      </div>

      {stats && (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-4 shadow-card">
              <p className="text-sm font-medium text-emerald-700">Bugün ziyaret</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{stats.todayVisits ?? "—"}</p>
              <p className="mt-1 text-xs text-slate-500">Sayfa görüntüleme</p>
            </div>
            <div className="rounded-xl border border-brand-200 bg-gradient-to-br from-brand-50 to-white p-4 shadow-card">
              <p className="text-sm font-medium text-brand-700">Bugün işlem</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{stats.todayActivities}</p>
              <p className="mt-1 text-xs text-slate-500">AI üretim sayısı</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-card">
              <p className="text-sm font-medium text-slate-500">Bugün aktif kullanıcı</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{stats.todayUniqueUsers}</p>
              <p className="mt-1 text-xs text-slate-500">İşlem yapan</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-card">
              <p className="text-sm font-medium text-slate-500">Toplam kayıt</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{stats.totalRegistrations}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-card">
              <p className="text-sm font-medium text-slate-500">Toplam işlem</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{stats.totalActivities}</p>
            </div>
          </div>

          {stats.moduleBreakdown && stats.moduleBreakdown.length > 0 && (
            <div className="mb-8 rounded-xl border border-slate-200 bg-white p-4 shadow-card">
              <h3 className="mb-3 text-sm font-bold text-slate-700">Bugün modüle göre dağılım</h3>
              <div className="flex flex-wrap gap-3">
                {stats.moduleBreakdown.map((m) => (
                  <span
                    key={m.module}
                    className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700"
                  >
                    <span className="rounded bg-brand-100 px-2 py-0.5 text-xs font-bold text-brand-700">{m.count}</span>
                    {m.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <div className="mb-10">
        <h2 className="mb-4 text-lg font-bold text-slate-900">Son aktiviteler</h2>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[400px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 font-semibold text-slate-700">E-posta</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Modül</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Tarih</th>
                </tr>
              </thead>
              <tbody>
                {activities.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-slate-500">
                      Henüz aktivite yok.
                    </td>
                  </tr>
                ) : (
                  activities.map((a) => (
                    <tr key={a.id} className="border-b border-slate-100">
                      <td className="px-4 py-3 font-medium text-slate-900">{a.email}</td>
                      <td className="px-4 py-3">
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                          {MODULE_LABELS[a.module] || a.module}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {new Date(a.createdAt).toLocaleString("tr-TR", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="mb-4 text-lg font-bold text-slate-900">Kayıtlı kullanıcılar</h2>
      <p className="mb-4 text-sm text-slate-600">
        Telefondan veya bilgisayardan kayıt olan tüm kullanıcılar burada listelenir.
        </p>
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleMigrate}
            disabled={migrating}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            {migrating ? "…" : "🔄 one_time_credits migration"}
          </button>
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
                <th className="px-4 py-3 font-semibold text-slate-700">Premium</th>
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
                      {u.is_admin ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">Sınırsız (Admin)</span>
                      ) : u.is_pro ? (
                        <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700">
                          Premium{u.pro_expires_at ? ` (${new Date(u.pro_expires_at).toLocaleDateString("tr-TR")})` : u.premium_credits ? ` (${u.premium_credits} hak)` : ""}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 flex gap-2">
                      {!u.is_admin && !u.is_pro && (
                        <button
                          type="button"
                          onClick={() => setPremiumModal({ userId: u.id, email: u.email || "" })}
                          disabled={!!settingPro}
                          className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
                        >
                          Premium ver
                        </button>
                      )}
                      {!u.is_admin && u.is_pro && (
                        <button
                          type="button"
                          onClick={() => handleRevokePremium(u.id)}
                          disabled={!!revoking}
                          className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                        >
                          {revoking === u.id ? "…" : "Premium geri al"}
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

      {premiumModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60">
          <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900">Premium ver</h3>
            <p className="mt-1 text-sm text-slate-600">{premiumModal.email}</p>
            <div className="mt-4 space-y-3">
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-3">
                <input type="radio" name="premiumType" checked={premiumType === "monthly"} onChange={() => setPremiumType("monthly")} className="text-brand-600" />
                <span>1 aylık</span>
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-3">
                <input type="radio" name="premiumType" checked={premiumType === "yearly"} onChange={() => setPremiumType("yearly")} className="text-brand-600" />
                <span>1 yıllık</span>
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-3">
                <input type="radio" name="premiumType" checked={premiumType === "credits"} onChange={() => setPremiumType("credits")} className="text-brand-600" />
                <span>Kullanım hakkı:</span>
                <input
                  type="number"
                  min={1}
                  max={9999}
                  value={premiumCredits}
                  onChange={(e) => setPremiumCredits(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-20 rounded border border-slate-300 px-2 py-1 text-sm"
                />
              </label>
            </div>
            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={() => setPremiumModal(null)}
                className="flex-1 rounded-lg border border-slate-300 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={handleSetPremium}
                disabled={!!settingPro}
                className="flex-1 rounded-lg bg-brand-600 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
              >
                {settingPro ? "…" : "Ver"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
