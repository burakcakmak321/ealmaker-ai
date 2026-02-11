import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Logo from "@/components/Logo";
import UsageBanner from "@/components/UsageBanner";
import PromoBanner from "@/components/PromoBanner";
import AuthNav from "@/components/AuthNav";
import CookieConsent from "@/components/CookieConsent";
import { SITE_NAME, BUSINESS } from "@/lib/brand";
import { ToastProvider } from "@/components/Toast";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  applicationName: SITE_NAME,
  title: `${SITE_NAME} | Metin Üretme Aracı (Bilgilendirme Amaçlı)`,
  description:
    "Fatura itirazı, pazarlık, resmi yazı taslağı ve CV metni üretme aracı. ⚠️ Hukuki tavsiye değildir. KVKK uyumlu. Profesyonel destek önerilir.",
  openGraph: {
    title: `${SITE_NAME} — Metin Üretme Aracı`,
    description: "Bilgilendirme amaçlı metin üretim platformu. Hukuki tavsiye değildir.",
  },
};

export const viewport = { width: "device-width", initialScale: 1 };

const navLinks = [
  { href: "/fatura", label: "Fatura İtirazı" },
  { href: "/pazarlik", label: "Pazarlık" },
  { href: "/dilekce", label: "Resmi Yazı" },
  { href: "/cv", label: "CV Oluşturucu" },
  { href: "/fiyatlandirma", label: "Fiyatlandırma" },
];

const footerProduct = [
  { href: "/fatura", label: "Fatura İtirazı" },
  { href: "/pazarlik", label: "Pazarlık" },
  { href: "/dilekce", label: "Resmi Yazı Taslağı" },
  { href: "/cv", label: "CV Oluşturucu" },
  { href: "/fiyatlandirma", label: "Fiyatlandırma" },
];
const footerSupport = [
  { href: "/sss", label: "SSS" },
  { href: "/iletisim", label: "İletişim" },
];
const footerLegal = [
  { href: "/gizlilik", label: "Gizlilik Politikası" },
  { href: "/kullanim", label: "Kullanım Koşulları" },
  { href: "/mesafeli-satis", label: "Mesafeli Satış" },
  { href: "/on-bilgilendirme", label: "Ön Bilgilendirme" },
  { href: "/cerezler", label: "Çerez Politikası" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={plusJakarta.variable}>
      <body className="min-h-screen antialiased font-sans">
        <ToastProvider>
          <PromoBanner />
          <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/98 shadow-sm backdrop-blur-xl">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
              <Link
                href="/"
                className="flex shrink-0 items-center gap-2.5 text-base font-bold tracking-tight text-slate-900 transition hover:text-brand-600 sm:text-lg"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-soft sm:h-9 sm:w-9">
                  <Logo className="h-5 w-5 sm:h-6 sm:w-6" />
                </span>
                <span>{SITE_NAME}</span>
              </Link>
              <nav className="flex flex-wrap items-center justify-end gap-1 sm:gap-2" aria-label="Ana menü">
                {navLinks.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                  >
                    {label}
                  </Link>
                ))}
                <AuthNav />
              </nav>
            </div>
          </header>

          <div className="mx-auto max-w-6xl px-4 py-2 sm:px-6" data-hide-print>
            <UsageBanner />
          </div>

          <main className="min-h-[60vh]">{children}</main>

          <CookieConsent />

          <footer className="border-t border-slate-200 bg-slate-900 text-slate-300 shadow-[0_-4px_24px_-4px_rgba(0,0,0,.08)]">
            <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
              <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
                <div className="sm:col-span-2 lg:col-span-2">
                  <Link href="/" className="inline-flex items-center gap-2 text-white">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500">
                      <Logo className="h-5 w-5" />
                    </span>
                    <span className="text-lg font-bold">{SITE_NAME}</span>
                  </Link>
                  <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
                    Metin taslağı üretim platformu. Fatura itirazı, pazarlık, resmi yazı taslağı ve CV — yapay zeka ile profesyonel taslaklar oluşturun.
                  </p>
                  <p className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                    <span>🔒 SSL güvenli</span>
                    <span>🇹🇷 Türkiye&apos;de</span>
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
                    Ürün
                  </h3>
                  <ul className="mt-4 space-y-3">
                    {footerProduct.map(({ href, label }) => (
                      <li key={href}>
                        <Link href={href} className="transition hover:text-white">{label}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
                    Destek
                  </h3>
                  <ul className="mt-4 space-y-3">
                    {footerSupport.map(({ href, label }) => (
                      <li key={href}>
                        <Link href={href} className="transition hover:text-white">{label}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
                    Yasal
                  </h3>
                  <ul className="mt-4 space-y-3">
                    {footerLegal.map(({ href, label }) => (
                      <li key={href}>
                        <Link href={href} className="transition hover:text-white">{label}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="mt-12 space-y-6 border-t border-slate-800 pt-8">
                <div className="rounded-lg bg-slate-800/50 px-4 py-4 text-xs text-slate-400">
                  <p className="font-semibold text-slate-300">{BUSINESS.unvan}</p>
                  <p className="mt-1">Vergi Dairesi: {BUSINESS.vergiDairesi}{BUSINESS.vkn ? ` · VKN: ${BUSINESS.vkn}` : ""}</p>
                  <p>{BUSINESS.adres} · Tel: {BUSINESS.telefon} · {BUSINESS.email}</p>
                </div>
                <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                  <p className="text-sm text-slate-500">
                    © {new Date().getFullYear()} {SITE_NAME}. Tüm hakları saklıdır.
                  </p>
                  <p className="text-sm text-slate-500">
                    Metin taslaklarınızı oluşturun. Hukuki tavsiye değildir.
                  </p>
                </div>
              </div>
            </div>
          </footer>
        </ToastProvider>
      </body>
    </html>
  );
}
