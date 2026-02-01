import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import UsageBanner from "@/components/UsageBanner";
import PromoBanner from "@/components/PromoBanner";
import { ToastProvider } from "@/components/Toast";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DealMaker AI | Metin Üretme Aracı (Bilgilendirme Amaçlı)",
  description:
    "Fatura itirazı, pazarlık ve dilekçe metni üretme aracı. ⚠️ Hukuki tavsiye değildir. Kullanım sorumluluğu size aittir. Profesyonel destek önerilir.",
  openGraph: {
    title: "DealMaker AI — Metin Üretme Aracı",
    description: "Bilgilendirme amaçlı metin üretim platformu. Hukuki tavsiye değildir.",
  },
};

const navLinks = [
  { href: "/fatura", label: "Fatura İtirazı" },
  { href: "/pazarlik", label: "Pazarlık" },
  { href: "/dilekce", label: "Dilekçe" },
  { href: "/fiyatlandirma", label: "Fiyatlandırma" },
];

const footerProduct = [
  { href: "/fatura", label: "Fatura İtirazı" },
  { href: "/pazarlik", label: "Pazarlık" },
  { href: "/dilekce", label: "Dilekçe" },
  { href: "/fiyatlandirma", label: "Fiyatlandırma" },
];
const footerSupport = [
  { href: "/sss", label: "SSS" },
  { href: "/iletisim", label: "İletişim" },
];
const footerLegal = [
  { href: "/gizlilik", label: "Gizlilik Politikası" },
  { href: "/kullanim", label: "Kullanım Koşulları" },
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
          <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
              <Link
                href="/"
                className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-slate-900 transition hover:text-brand-600"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 text-lg text-white shadow-soft">
                  ⚖️
                </span>
                <span>DealMaker AI</span>
              </Link>
              <nav className="flex items-center gap-1" aria-label="Ana menü">
                {navLinks.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                  >
                    {label}
                  </Link>
                ))}
                <Link
                  href="/fatura"
                  className="ml-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-700"
                >
                  Ücretsiz Dene
                </Link>
              </nav>
            </div>
          </header>

          <div className="mx-auto max-w-6xl px-4 py-2 sm:px-6" data-hide-print>
            <UsageBanner />
          </div>

          <main className="min-h-[60vh]">{children}</main>

          <footer className="border-t border-slate-200 bg-slate-900 text-slate-300">
            <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
              <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
                <div className="sm:col-span-2 lg:col-span-2">
                  <Link href="/" className="inline-flex items-center gap-2 text-white">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500 text-lg">
                      ⚖️
                    </span>
                    <span className="text-lg font-bold">DealMaker AI</span>
                  </Link>
                  <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
                    Türkiye&apos;nin profesyonel hak arayış platformu. Fatura itirazı, pazarlık ve dilekçe — hepsini yapay zeka ile profesyonelce yaz.
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
              <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-8 sm:flex-row">
                <p className="text-sm text-slate-500">
                  © {new Date().getFullYear()} DealMaker AI. Tüm hakları saklıdır.
                </p>
                <p className="text-sm text-slate-500">
                  Haklarınızı savunun, pazarlık yapın, dilekçe yazın.
                </p>
              </div>
            </div>
          </footer>
        </ToastProvider>
      </body>
    </html>
  );
}
