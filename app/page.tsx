import Link from "next/link";
import {
  STATS,
  TRUST_BADGES,
  FEATURES,
  TEMPLATE_CATEGORIES,
  POPULAR_TEMPLATES,
  TESTIMONIALS,
  FAQ_HOME,
} from "@/lib/data";

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-mesh bg-grid">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700">
              <span className="h-2 w-2 animate-pulse rounded-full bg-brand-500" />
              Bilgilendirme amaçlı metin üretim platformu
            </span>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Profesyonel metin taslağı{" "}
              <span className="bg-gradient-to-r from-brand-600 via-brand-500 to-brand-600 bg-clip-text text-transparent">
                hızlıca oluşturun
              </span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-slate-600 sm:text-xl">
              Fatura itirazı, pazarlık, resmi yazı taslağı ve CV —
              <strong> 50+ senaryo</strong> ile metin taslağı üretin. 
              <span className="font-semibold text-amber-700"> ⚠️ Hukuki tavsiye değildir.</span>
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/fatura"
                className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-7 py-4 font-semibold text-white shadow-soft transition hover:bg-brand-700 hover:shadow-card-hover"
              >
                Hemen Başla — Ücretsiz
                <span className="text-white/80">→</span>
              </Link>
              <Link
                href="/#sablonlar"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-7 py-4 font-semibold text-slate-700 transition hover:border-brand-200 hover:bg-slate-50"
              >
                Şablonları incele
              </Link>
            </div>
            {/* Sosyal kanıt */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-600">
              <span className="flex items-center gap-2">
                <span className="flex -space-x-2">
                  {["AK", "FY", "ME", "SÖ", "HT"].map((initials, i) => (
                    <span
                      key={i}
                      className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-brand-100 text-xs font-bold text-brand-700"
                    >
                      {initials}
                    </span>
                  ))}
                </span>
                <span className="font-medium text-slate-700">2.800+</span> kullanıcı bu hafta metin oluşturdu
              </span>
              <span className="flex items-center gap-1 font-medium text-amber-600">
                ★★★★★ 4.9
              </span>
            </div>
          </div>
        </div>
        {/* İstatistik çubuğu */}
        <div className="border-t border-slate-200/80 bg-white/80 backdrop-blur">
          <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
              {STATS.map((stat, i) => (
                <div key={i} className="text-center">
                  <p className="text-2xl font-bold text-slate-900 sm:text-3xl">{stat.value}</p>
                  <p className="mt-0.5 text-sm text-slate-600">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Güven rozetleri */}
      <section className="border-b border-slate-200/80 bg-gradient-to-b from-slate-50 to-white py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-5 text-center text-sm text-slate-600">
            {TRUST_BADGES.map((badge, i) => (
              <span key={i} className="flex items-center gap-2.5 rounded-full bg-white px-4 py-2 shadow-sm ring-1 ring-slate-200/80">
                <span className="text-lg">{badge.icon}</span>
                <span className="font-medium text-slate-700">{badge.label}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Neden YazıAsistan - 6 özellik */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Neden YazıAsistan?
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Profesyonel metin hazırlamanın en kolay, en hızlı ve en güvenilir yolu
          </p>
        </div>
        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card transition hover:border-brand-200 hover:shadow-soft sm:p-8"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-2xl">
                {f.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-900">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.description}</p>
              {i === 0 && (
                <p className="mt-3 text-xs font-semibold text-amber-700">
                  ⚠️ Üretilen metinler taslaktır. Profesyonel kontrol önerilir.
                </p>
              )}
              <ul className="mt-4 space-y-1.5 text-sm text-slate-600">
                {f.items.map((item, j) => (
                  <li key={j} className="flex items-center gap-2">
                    <span className="text-brand-500">✓</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Nasıl çalışır */}
      <section className="border-t border-slate-200/80 bg-slate-50/80">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              3 adımda profesyonel metin
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Modülü seç, bilgileri gir, metni al. Bu kadar basit.
            </p>
          </div>
          <div className="mt-14 grid gap-10 sm:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-xl font-bold text-white shadow-soft">
                1
              </div>
              <h3 className="mt-5 text-lg font-bold text-slate-900">Kategori / modül seçin</h3>
              <p className="mt-2 text-slate-600">
                Fatura, pazarlık, resmi yazı taslağı veya CV — ihtiyacınıza uygun modülü seçin.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-xl font-bold text-white shadow-soft">
                2
              </div>
              <h3 className="mt-5 text-lg font-bold text-slate-900">Bilgileri girin</h3>
              <p className="mt-2 text-slate-600">
                Kurum, konu, tutar gibi alanları doldurun; detayı isterseniz yazın.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-xl font-bold text-white shadow-soft">
                3
              </div>
              <h3 className="mt-5 text-lg font-bold text-slate-900">İndirin / kopyalayın</h3>
              <p className="mt-2 text-slate-600">
                Metni kopyalayın, yazdırın veya PDF olarak kaydedin.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Şablon kategorileri */}
      <section id="sablonlar" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Her ihtiyaca uygun 50+ senaryo
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            En çok kullanılan kategoriler ve profesyonel şablonlar
          </p>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TEMPLATE_CATEGORIES.map((cat, i) => (
            <Link
              key={i}
              href={cat.href}
              className="group rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card transition hover:border-brand-200 hover:shadow-soft sm:p-8"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-2xl group-hover:bg-brand-200">
                {cat.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-900">{cat.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{cat.description}</p>
              <p className="mt-3 text-xs font-medium text-brand-600">
                {cat.count} · {cat.usage}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {cat.tags.map((tag, j) => (
                  <span
                    key={j}
                    className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
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
      <section className="border-t border-slate-200/80 bg-slate-50/80">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              En popüler şablonlar
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Sadece bilgilerinizi girin, profesyonel metniniz anında hazır
            </p>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {POPULAR_TEMPLATES.map((t, i) => (
              <Link
                key={i}
                href={t.href}
                className="group flex items-start gap-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card transition hover:border-brand-200 hover:shadow-soft"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-2xl group-hover:bg-brand-200">
                  {t.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-slate-900">{t.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    %{t.success} başarı · {t.usage} kullanım
                  </p>
                  <p className="mt-2 text-sm font-semibold text-brand-600">{t.price}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/fiyatlandirma"
              className="text-sm font-semibold text-brand-600 hover:underline"
            >
              Tüm şablonlar ve fiyatlar →
            </Link>
          </div>
        </div>
      </section>

      {/* Fiyatlandırma özet + karşılaştırma tablosu */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Basit ve şeffaf fiyatlandırma
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            İlk 2 kullanım ücretsiz. Tek seferlik 29 ₺ veya Pro 99 ₺/ay ile devam edin.
          </p>
        </div>
        <div className="mt-14 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="px-6 py-4 font-semibold text-slate-900">Özellik</th>
                  <th className="px-6 py-4 font-semibold text-slate-900">Ücretsiz</th>
                  <th className="px-6 py-4 font-semibold text-slate-900">Pro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr><td className="px-6 py-3 text-slate-600">Kullanım sayısı</td><td className="px-6 py-3">2 adet</td><td className="px-6 py-3 font-semibold text-brand-600">Sınırsız</td></tr>
                <tr><td className="px-6 py-3 text-slate-600">Modüller</td><td className="px-6 py-3">Tümü</td><td className="px-6 py-3">Tümü</td></tr>
                <tr><td className="px-6 py-3 text-slate-600">PDF / yazdır</td><td className="px-6 py-3">✓</td><td className="px-6 py-3">✓</td></tr>
                <tr><td className="px-6 py-3 text-slate-600">Öncelikli destek</td><td className="px-6 py-3">—</td><td className="px-6 py-3">✓</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="mt-10 flex justify-center">
          <Link
            href="/fiyatlandirma"
            className="rounded-xl bg-brand-600 px-8 py-4 font-semibold text-white shadow-soft transition hover:bg-brand-700"
          >
            Fiyatlandırmayı incele
          </Link>
        </div>
      </section>

      {/* Kullanıcı yorumları */}
      <section className="border-t border-slate-200/80 bg-slate-50/80">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              2.800+ mutlu kullanıcı
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Gerçek kullanıcıların deneyimleri
            </p>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card"
              >
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <span key={j}>★</span>
                  ))}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">&quot;{t.text}&quot;</p>
                <div className="mt-4 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                    {t.initials}
                  </span>
                  <div>
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
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Sıkça sorulan sorular
          </h2>
        </div>
        <dl className="mx-auto mt-14 max-w-3xl space-y-6">
          {FAQ_HOME.map((faq, i) => (
            <div key={i} className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-card">
              <dt className="font-semibold text-slate-900">{faq.q}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-slate-600">{faq.a}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-10 text-center">
          <Link href="/sss" className="text-sm font-semibold text-brand-600 hover:underline">
            Tüm SSS →
          </Link>
        </div>
      </section>

      {/* Son CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-600 to-brand-800 p-10 shadow-glow sm:p-16">
          <div className="absolute inset-0 bg-grid opacity-10" aria-hidden />
          <div className="relative mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Profesyonel metninizi hemen oluşturun
            </h2>
            <p className="mt-4 text-lg text-white/90">
              2.800+ kullanıcı YazıAsistan ile profesyonel metinler hazırlıyor. Siz de katılın.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/fatura"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 font-semibold text-brand-700 shadow-soft transition hover:bg-slate-50"
              >
                Ücretsiz Başla
                <span>→</span>
              </Link>
              <Link
                href="/fiyatlandirma"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-white/50 bg-white/10 px-8 py-4 font-semibold text-white transition hover:bg-white/20"
              >
                Pro — 99 ₺/ay
              </Link>
            </div>
            <p className="mt-6 text-sm text-white/80">
              ✓ Kredi kartı gerekmez ✓ 2 kullanım ücretsiz ✓ Hukuki tavsiye değildir
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
