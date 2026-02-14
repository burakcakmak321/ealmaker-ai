import type { Metadata } from "next";
import Link from "next/link";
import {
  STATS,
  TRUST_BADGES,
  TESTIMONIALS,
  FAQ_HOME,
} from "@/lib/data";

export const metadata: Metadata = {
  title: "AI Destekli Metin Asistani | E-Ticaret, Sosyal Medya, Resmi Yazi, SEO",
  description:
    "E-ticaret urun aciklamasi, sosyal medya icerigi, blog SEO araclari, dilekce, fatura itirazi ve CV taslagi. Turkiye geneli KVKK uyumlu AI destekli metin platformu.",
  keywords: "e-ticaret urun aciklamasi, sosyal medya icerik, blog seo, dilekce, fatura itirazi, cv olusturucu, metin donusturucu, yapay zeka yazi, ai metin",
};

const CATEGORIES = [
  {
    id: "icerik",
    title: "Icerik Uretimi",
    description: "E-ticaret, sosyal medya ve blog icerikleri",
    icon: "✨",
    gradient: "from-pink-500 to-rose-500",
    tools: [
      { title: "E-Ticaret Urun Aciklamasi", desc: "Trendyol, Hepsiburada, Amazon icin SEO uyumlu baslik ve aciklama", href: "/e-ticaret", icon: "🛒", badge: "11 platform" },
      { title: "Sosyal Medya Icerigi", desc: "Viral hooklar, video senaryolari, captionlar ve CTA onerileri", href: "/sosyal-medya", icon: "📱", badge: "5 platform" },
      { title: "Blog & SEO Araclari", desc: "Blog outline, meta aciklama, baslik onerileri, anahtar kelime analizi", href: "/blog-seo", icon: "📝", badge: "4 arac" },
    ],
  },
  {
    id: "resmi",
    title: "Resmi Yazilar",
    description: "Dilekce, fatura itirazi ve pazarlik mesajlari",
    icon: "📄",
    gradient: "from-blue-500 to-indigo-500",
    tools: [
      { title: "Fatura Itirazi", desc: "Internet, banka, operator faturasi ve abonelik itirazlari", href: "/fatura", icon: "📄", badge: "15+ senaryo" },
      { title: "Resmi Yazi / Dilekce", desc: "Belediye, kamu kurumlari icin resmi yazi ve dilekce taslaklari", href: "/dilekce", icon: "🏛️", badge: "12 sablon" },
      { title: "Pazarlik Mesaji", desc: "Ikinci el platformlar icin profesyonel pazarlik mesajlari", href: "/pazarlik", icon: "🤝", badge: "10+ senaryo" },
    ],
  },
  {
    id: "araclar",
    title: "Metin Araclari",
    description: "Donusturme, duzenleme ve kariyer araclari",
    icon: "🔧",
    gradient: "from-purple-500 to-violet-500",
    tools: [
      { title: "Metin Donusturucu", desc: "Resmi, sade, profesyonel veya insanlastirilmis metne cevirin", href: "/metin-donusturucu", icon: "🔄", badge: "5 donusum" },
      { title: "CV Olusturucu", desc: "Profesyonel, ATS dostu CV ve ozgecmis taslaklari", href: "/cv", icon: "📋", badge: "Tum sektorler" },
    ],
  },
];

const QUICK_TOOLS = [
  { title: "Trendyol Urun Aciklamasi", href: "/e-ticaret", icon: "🛒" },
  { title: "Instagram Icerik", href: "/sosyal-medya", icon: "📸" },
  { title: "Metin Insanlastir", href: "/metin-donusturucu", icon: "🧑" },
  { title: "Blog Outline", href: "/blog-seo", icon: "📑" },
  { title: "Fatura Itirazi", href: "/fatura", icon: "📄" },
  { title: "CV Olustur", href: "/cv", icon: "📋" },
];

export default function Home() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-slate-200/60 bg-gradient-to-br from-slate-50 via-white to-emerald-50">
        <div className="absolute inset-0 bg-grid opacity-40" aria-hidden />
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wider text-emerald-700 shadow-sm">
              Guvenli &bull; KVKK uyumlu &bull; 3D Secure
            </div>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl lg:leading-[1.1]">
              Tum metin ihtiyaclariniz{" "}
              <span className="bg-gradient-to-r from-emerald-600 via-brand-600 to-teal-500 bg-clip-text text-transparent">
                tek platformda
              </span>
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-slate-600 sm:text-xl">
              E-ticaret urun aciklamasi, sosyal medya icerigi, blog SEO, resmi yazi ve daha fazlasi.
              AI destekli, konunuza ozel, profesyonel metinler.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="#kategoriler"
                className="group inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-8 py-4 font-semibold text-white shadow-[0_8px_24px_-8px_rgba(5,150,105,.6)] transition hover:bg-emerald-700"
              >
                Araclari Kesfet
                <span className="transition group-hover:translate-x-0.5">&rarr;</span>
              </Link>
              <Link
                href="/fiyatlandirma"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-8 py-4 font-semibold text-slate-700 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50/50"
              >
                Fiyatlandirma
              </Link>
            </div>
          </div>

          <div className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
            {QUICK_TOOLS.map((t, i) => (
              <Link
                key={i}
                href={t.href}
                className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 p-4 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <span className="text-2xl">{t.icon}</span>
                <span className="text-xs font-semibold text-slate-700">{t.title}</span>
              </Link>
            ))}
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

      <section className="border-b border-slate-200/60 bg-white py-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {TRUST_BADGES.map((badge, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,.04)]"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-lg shadow-sm">
                  {badge.icon}
                </span>
                <span className="font-semibold">{badge.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="kategoriler" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Tum araclar, kategorilere ayrilmis
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Ihtiyaciniza uygun kategoriyi secin, araci kulllanin. Bu kadar basit.
          </p>
        </div>

        <div className="mt-16 space-y-16">
          {CATEGORIES.map((cat) => (
            <div key={cat.id}>
              <div className="mb-8 flex items-center gap-3">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${cat.gradient} text-white text-xl shadow-lg`}>
                  {cat.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{cat.title}</h3>
                  <p className="text-sm text-slate-500">{cat.description}</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {cat.tools.map((tool, j) => (
                  <Link
                    key={j}
                    href={tool.href}
                    className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition hover:-translate-y-1 hover:shadow-card-hover"
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-2xl transition group-hover:bg-emerald-50">
                        {tool.icon}
                      </span>
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        {tool.badge}
                      </span>
                    </div>
                    <h4 className="text-lg font-bold text-slate-900">{tool.title}</h4>
                    <p className="mt-2 flex-1 text-sm text-slate-600">{tool.desc}</p>
                    <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-emerald-600 transition group-hover:text-emerald-700">
                      Kullan <span className="transition group-hover:translate-x-0.5">&rarr;</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-slate-200/60 bg-gradient-to-b from-slate-50 to-white py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              3 adimda profesyonel metin
            </h2>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {[
              { n: 1, title: "Araci secin", desc: "E-ticaret, sosyal medya, resmi yazi veya metin donusturucu - ihtiyaciniza uygun araci secin." },
              { n: 2, title: "Bilgileri girin", desc: "Konunuzu, platformu, dil tonunu secin. Ne kadar detay verirseniz o kadar iyi sonuc alirsiniz." },
              { n: 3, title: "Duzenleyin ve kullanin", desc: "Sonucu site icinde duzenleyin (kalin, italik, baslik), kopyalayin veya daha da donusturun." },
            ].map((s) => (
              <div key={s.n} className="relative rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-card">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-brand-600 text-lg font-bold text-white shadow-soft">
                  {s.n}
                </div>
                <h3 className="mt-6 text-lg font-bold text-slate-900">{s.title}</h3>
                <p className="mt-2 text-slate-600">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Neden biz?
          </h2>
        </div>
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: "🎯", title: "Konuya odakli AI", desc: "Genel kalip cevaplar degil, verdiginiz bilgilere gore OZEL ve OZGUN icerikler uretiyoruz." },
            { icon: "📊", title: "Strateji + Icerik", desc: "Sadece metin degil, her onerinin NEDEN ise yaradigini da acikliyoruz. Strateji ogrenin." },
            { icon: "🔄", title: "Site icinde duzenleme", desc: "Sonuclari kalin, italik, baslik ekleyerek site icinde duzenleyin. Word'e atmaniza gerek yok." },
            { icon: "🧑", title: "Insanlastirma", desc: "AI tespit araclarindan kacinmak icin metinleri daha dogal, insan yazisi gibi donusturun." },
            { icon: "🛡️", title: "Guvenli & KVKK", desc: "256-bit SSL, veri saklanmaz, 3D Secure odeme. Verileriniz guvendedir." },
            { icon: "⚡", title: "Aninda sonuc", desc: "Saniyeler icinde profesyonel metinler. Gunluk 3 ucretsiz kullanim." },
          ].map((f, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition hover:-translate-y-1 hover:shadow-card-hover">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-brand-600 text-xl text-white shadow-soft">
                {f.icon}
              </span>
              <h3 className="mt-5 text-lg font-bold text-slate-900">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-slate-200/60 bg-slate-50/80 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Basit ve seffaf fiyatlandirma
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Gunluk 3 ucretsiz kullanim. Premium ile sinirsiz erisim.
            </p>
          </div>
          <div className="mt-14 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    <th className="px-6 py-4 font-semibold text-slate-900">Ozellik</th>
                    <th className="px-6 py-4 font-semibold text-slate-900">Ucretsiz</th>
                    <th className="px-6 py-4 font-semibold text-brand-600">Premium</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr><td className="px-6 py-3.5 text-slate-600">Kullanim sayisi</td><td className="px-6 py-3.5">Gunluk 3</td><td className="px-6 py-3.5 font-semibold text-brand-600">Sinirsiz</td></tr>
                  <tr><td className="px-6 py-3.5 text-slate-600">Tum moduller</td><td className="px-6 py-3.5">&#10003;</td><td className="px-6 py-3.5">&#10003;</td></tr>
                  <tr><td className="px-6 py-3.5 text-slate-600">Zengin metin editoru</td><td className="px-6 py-3.5">&#10003;</td><td className="px-6 py-3.5">&#10003;</td></tr>
                  <tr><td className="px-6 py-3.5 text-slate-600">Insanlastirma / Donusturme</td><td className="px-6 py-3.5">&#10003;</td><td className="px-6 py-3.5">&#10003;</td></tr>
                  <tr><td className="px-6 py-3.5 text-slate-600">Oncelikli destek</td><td className="px-6 py-3.5">&mdash;</td><td className="px-6 py-3.5">&#10003;</td></tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="mt-10 flex justify-center">
            <Link href="/fiyatlandirma" className="rounded-xl bg-brand-600 px-8 py-4 font-semibold text-white shadow-[0_4px_14px_-2px_rgba(5,150,105,.4)] transition hover:bg-brand-700">
              Fiyatlandirmayi incele
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Kullanici yorumlari
            </h2>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition hover:-translate-y-1 hover:shadow-card-hover">
                <div className="flex items-center gap-0.5 text-amber-500">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <span key={j}>&#9733;</span>
                  ))}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">&quot;{t.text}&quot;</p>
                <div className="mt-4 flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                    {t.initials}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.city} &middot; {t.type}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Sikca sorulan sorular
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
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 sm:pb-28">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-brand-600 to-teal-700 p-10 shadow-glow sm:p-16">
          <div className="absolute inset-0 bg-grid opacity-10" aria-hidden />
          <div className="relative mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Profesyonel metninizi hemen olusturun
            </h2>
            <p className="mt-4 text-lg text-white/90">
              10+ arac, 20+ platform destegi, site icinde duzenleme. Ucretsiz baslayin.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/e-ticaret"
                className="group inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 font-semibold text-emerald-700 shadow-[0_4px_14px_-2px_rgba(0,0,0,.2)] transition hover:bg-slate-50"
              >
                Ucretsiz Basla
                <span className="transition group-hover:translate-x-0.5">&rarr;</span>
              </Link>
              <Link
                href="/fiyatlandirma"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-white/50 bg-white/10 px-8 py-4 font-semibold text-white transition hover:bg-white/20"
              >
                Premium paketler
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
