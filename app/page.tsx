import type { Metadata } from "next";
import Link from "next/link";
import DocumentMockup from "@/components/DocumentMockup";
import {
  STATS,
  TRUST_BADGES,
  FEATURES,
  TEMPLATE_CATEGORIES,
  POPULAR_TEMPLATES,
  TESTIMONIALS,
  FAQ_HOME,
} from "@/lib/data";

export const metadata: Metadata = {
  title: "AI Destekli Dilekçe, Fatura İtirazı ve CV Taslakları",
  description:
    "Türkiye genelinde fatura itirazı, pazarlık, resmi yazı/dilekçe ve CV metni taslakları. KVKK uyumlu, hızlı ve profesyonel.",
};

export default function Home() {
  return (
    <>
      {/* Hero — Fintech güven odaklı */}
      <section className="relative overflow-hidden border-b border-slate-200/60 bg-gradient-to-br from-slate-50 via-white to-emerald-50">
        <div className="absolute inset-0 bg-grid opacity-40" aria-hidden />
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wider text-emerald-700 shadow-sm">
                Güvenli • KVKK uyumlu • 3D Secure
              </div>
              <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl lg:leading-[1.1]">
                Resmi metinlerinizi{" "}
                <span className="bg-gradient-to-r from-emerald-600 via-brand-600 to-teal-500 bg-clip-text text-transparent">
                  güvenle ve hızlıca
                </span>{" "}
                hazırlayın
              </h1>
              <p className="mt-5 text-lg leading-relaxed text-slate-600 sm:text-xl">
                Fatura itirazı, pazarlık, dilekçe ve CV taslaklarını profesyonel formatta üretin.
                <span className="mt-2 block text-sm font-semibold text-amber-700">Bilgilendirme amaçlıdır. Hukuki tavsiye değildir.</span>
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/fatura"
                  className="group inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-8 py-4 font-semibold text-white shadow-[0_8px_24px_-8px_rgba(5,150,105,.6)] transition hover:bg-emerald-700"
                >
                  Hemen Başla — Ücretsiz
                  <span className="transition group-hover:translate-x-0.5">→</span>
                </Link>
                <Link
                  href="/fiyatlandirma"
                  className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-8 py-4 font-semibold text-slate-700 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50/50"
                >
                  Fiyatlandırmayı incele
                </Link>
              </div>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {[
                  { t: "SSL/TLS", d: "Şifreli veri aktarımı" },
                  { t: "KVKK", d: "Veri koruma uyumu" },
                  { t: "3D Secure", d: "Güvenli ödeme" },
                ].map((item) => (
                  <div key={item.t} className="rounded-xl border border-slate-200 bg-white/80 p-4 text-sm text-slate-600 shadow-sm">
                    <p className="font-semibold text-slate-900">{item.t}</p>
                    <p className="mt-1">{item.d}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center lg:justify-end">
              <DocumentMockup />
            </div>
          </div>
        </div>
        <div className="border-t border-slate-200/60 bg-white/90 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
              {STATS.map((stat, i) => (
                <div key={i} className="text-center">
                  <p className="text-2xl font-bold text-slate-900 sm:text-3xl">{stat.value}</p>
                  <p className="mt-1 text-sm text-slate-600">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Güven rozetleri */}
      <section className="border-b border-slate-200/60 bg-white py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {TRUST_BADGES.map((badge, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,.04)]"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-lg shadow-sm">
                  {badge.icon}
                </span>
                <span className="font-semibold">{badge.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Neden YazıAsistan */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Neden YazıAsistan?
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Güven odaklı, hızlı ve resmi formatlara uygun metin taslağı üretimi.
          </p>
        </div>
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition hover:-translate-y-1 hover:shadow-card-hover sm:p-8"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-brand-600 text-white shadow-soft">
                <span className="text-xl">{f.icon}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.description}</p>
              {i === 0 && (
                <p className="mt-3 text-xs font-semibold text-amber-700">
                  Üretilen metinler taslaktır. Profesyonel kontrol önerilir.
                </p>
              )}
              <ul className="mt-5 space-y-2 text-sm text-slate-600">
                {f.items.map((item, j) => (
                  <li key={j} className="flex items-center gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Nasıl çalışır */}
      <section className="border-t border-slate-200/60 bg-gradient-to-b from-slate-50 to-white py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              3 adımda profesyonel metin
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Modülü seç, bilgileri gir, metni al. Bu kadar basit.
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {[
              { n: 1, title: "Kategori / modül seçin", desc: "Fatura, pazarlık, resmi yazı taslağı veya CV — ihtiyacınıza uygun modülü seçin." },
              { n: 2, title: "Bilgileri girin", desc: "Kurum, konu, tutar gibi alanları doldurun; detayı isterseniz yazın." },
              { n: 3, title: "İndirin / kopyalayın", desc: "Metni kopyalayın, yazdırın veya PDF olarak kaydedin." },
            ].map((s) => (
              <div key={s.n} className="relative rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-card">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-brand-600 text-lg font-bold text-white shadow-soft">
                  {s.n}
                </div>
                <h3 className="mt-6 text-lg font-bold text-slate-900">{s.title}</h3>
                <p className="mt-2 text-slate-600">{s.desc}</p>
                {s.n < 3 && (
                  <div className="absolute left-[calc(50%+4rem)] top-8 hidden h-0.5 w-[calc(100%-8rem)] bg-gradient-to-r from-emerald-200 to-transparent sm:block" aria-hidden />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Şablon kategorileri */}
      <section id="sablonlar" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Her ihtiyaca uygun 50+ senaryo
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            AI destekli şablonlar — fatura itirazı, dilekçe, pazarlık, CV
          </p>
        </div>
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TEMPLATE_CATEGORIES.map((cat, i) => (
            <Link
              key={i}
              href={cat.href}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition hover:-translate-y-1 hover:shadow-card-hover sm:p-8"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-2xl transition group-hover:bg-emerald-100">
                {cat.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-900">{cat.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{cat.description}</p>
              <p className="mt-3 text-xs font-medium text-emerald-700">
                {cat.count} · {cat.usage}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {cat.tags.map((tag, j) => (
                  <span
                    key={j}
                    className="rounded-lg bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Popüler şablonlar */}
      <section className="border-t border-slate-200/60 bg-slate-50/80 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              En popüler şablonlar
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              AI destekli şablonlarla bilgilerinizi girin, metniniz anında hazır
            </p>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {POPULAR_TEMPLATES.map((t, i) => (
              <Link
                key={i}
                href={t.href}
                className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition hover:-translate-y-1 hover:shadow-card-hover"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-2xl transition group-hover:bg-emerald-100">
                  {t.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-slate-900">{t.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    %{t.success} başarı · {t.usage} kullanım
                  </p>
                  <p className="mt-2 text-sm font-semibold text-emerald-700">{t.price}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/fiyatlandirma"
              className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 transition hover:text-brand-700 hover:underline"
            >
              Tüm şablonlar ve fiyatlar
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Fiyatlandırma özet */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Basit ve şeffaf fiyatlandırma
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Günlük 3 ücretsiz kullanım. Premium ile sınırsız erişim.
          </p>
        </div>
        <div className="mt-14 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="px-6 py-4 font-semibold text-slate-900">Özellik</th>
                  <th className="px-6 py-4 font-semibold text-slate-900">Ücretsiz</th>
                  <th className="px-6 py-4 font-semibold text-brand-600">Premium</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr><td className="px-6 py-3.5 text-slate-600">Kullanım sayısı</td><td className="px-6 py-3.5">Günlük 3</td><td className="px-6 py-3.5 font-semibold text-brand-600">Sınırsız</td></tr>
                <tr><td className="px-6 py-3.5 text-slate-600">Modüller</td><td className="px-6 py-3.5">Tümü</td><td className="px-6 py-3.5">Tümü</td></tr>
                <tr><td className="px-6 py-3.5 text-slate-600">PDF / yazdır</td><td className="px-6 py-3.5">✓</td><td className="px-6 py-3.5">✓</td></tr>
                <tr><td className="px-6 py-3.5 text-slate-600">Öncelikli destek</td><td className="px-6 py-3.5">—</td><td className="px-6 py-3.5">✓</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="mt-10 flex justify-center">
          <Link
            href="/fiyatlandirma"
            className="rounded-xl bg-brand-600 px-8 py-4 font-semibold text-white shadow-[0_4px_14px_-2px_rgba(5,150,105,.4)] transition hover:bg-brand-700"
          >
            Fiyatlandırmayı incele
          </Link>
        </div>
      </section>

      {/* Kullanıcı yorumları */}
      <section className="border-t border-slate-200/60 bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              2.800+ mutlu kullanıcı
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Gerçek kullanıcıların deneyimleri
            </p>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition hover:-translate-y-1 hover:shadow-card-hover"
              >
                <div className="flex items-center gap-0.5 text-amber-500">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <span key={j}>★</span>
                  ))}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">&quot;{t.text}&quot;</p>
                <div className="mt-4 flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                    {t.initials}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.city} · {t.type}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SSS */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Sıkça sorulan sorular
          </h2>
        </div>
        <dl className="mx-auto mt-16 max-w-3xl space-y-4">
          {FAQ_HOME.map((faq, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
              <dt className="font-semibold text-slate-900">{faq.q}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-slate-600">{faq.a}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-10 text-center">
          <Link href="/sss" className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 transition hover:text-emerald-800 hover:underline">
            Tüm SSS
            <span>→</span>
          </Link>
        </div>
      </section>

      {/* Son CTA */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-brand-600 to-teal-700 p-10 shadow-glow sm:p-16">
          <div className="absolute inset-0 bg-grid opacity-10" aria-hidden />
          <div className="relative mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Profesyonel metninizi hemen oluşturun
            </h2>
            <p className="mt-4 text-lg text-white/90">
              Güvenilir altyapı, KVKK uyumu ve hızlı teslimat ile metinlerinizi güvenle hazırlayın.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/fatura"
                className="group inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 font-semibold text-emerald-700 shadow-[0_4px_14px_-2px_rgba(0,0,0,.2)] transition hover:bg-slate-50"
              >
                Ücretsiz Başla
                <span className="transition group-hover:translate-x-0.5">→</span>
              </Link>
              <Link
                href="/fiyatlandirma"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-white/50 bg-white/10 px-8 py-4 font-semibold text-white transition hover:bg-white/20"
              >
                Premium paketler
              </Link>
            </div>
            <p className="mt-6 text-sm text-white/80">
              ✓ SSL/TLS güvenli ✓ Günlük 3 kullanım ücretsiz ✓ Hukuki tavsiye değildir
            </p>
          </div>
        </div>
      </section>
    </>
  );
}