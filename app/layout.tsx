import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Logo from "@/components/Logo";
import UsageBanner from "@/components/UsageBanner";
import PromoBanner from "@/components/PromoBanner";
import AuthNav from "@/components/AuthNav";
import CookieConsent from "@/components/CookieConsent";
import { SITE_NAME, BUSINESS } from "@/lib/brand";
import { ToastProvider } from "@/components/Toast";
import NavDropdown from "@/components/NavDropdown";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const SITE_URL = "https://yazıasistani.com";

export const metadata: Metadata = {
  applicationName: SITE_NAME,
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | AI Destekli Metin Platformu`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Dilekçe nasıl yazılır, metin dönüştürücü, fatura itirazı, e-ticaret ürün açıklaması. AI destekli metin platformu. Türkiye geneli KVKK uyumlu.",
  keywords:
    "dilekçe nasıl yazılır, metin dönüştürücü, fatura itirazı, dilekçe örneği, resmi yazı nasıl yazılır, AI metin, e-ticaret ürün açıklaması, cv oluşturucu",
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: `${SITE_NAME} | AI Destekli Metin Platformu`,
    siteName: SITE_NAME,
    locale: "tr_TR",
    description:
      "E-ticaret, sosyal medya, blog SEO, resmi yazi ve metin donusturme araclari. Konunuza ozel, profesyonel icerikler.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport = { width: "device-width", initialScale: 1 };

const navLinks = [
  { href: "/e-ticaret", label: "E-Ticaret" },
  { href: "/sosyal-medya", label: "Sosyal Medya" },
  { href: "/blog-seo", label: "Blog & SEO" },
  { href: "/metin-donusturucu", label: "Metin Dönüştür" },
  { href: "/cv", label: "CV" },
  { href: "/fiyatlandirma", label: "Fiyat" },
];

const footerProduct = [
  { href: "/e-ticaret", label: "E-Ticaret Aciklamasi" },
  { href: "/sosyal-medya", label: "Sosyal Medya Icerigi" },
  { href: "/blog-seo", label: "Blog & SEO Araclari" },
  { href: "/metin-donusturucu", label: "Metin Donusturucu" },
  { href: "/fatura", label: "Fatura Itirazi" },
  { href: "/pazarlik", label: "Pazarlik Mesaji" },
  { href: "/dilekce", label: "Resmi Yazi/Dilekce" },
  { href: "/cv", label: "CV Olusturucu" },
  { href: "/fiyatlandirma", label: "Fiyatlandirma" },
];
const footerSupport = [
  { href: "/sss", label: "SSS" },
  { href: "/iletisim", label: "İletişim" },
  { href: "/hakkimizda", label: "Hakkımızda" },
];
const footerLegal = [
  { href: "/gizlilik", label: "Gizlilik Politikası" },
  { href: "/kullanim", label: "Kullanım Koşulları" },
  { href: "/mesafeli-satis", label: "Mesafeli Satış" },
  { href: "/on-bilgilendirme", label: "Ön Bilgilendirme" },
  { href: "/cerezler", label: "Çerez Politikası" },
  { href: "/iade-iptal", label: "İade ve İptal" },
  { href: "/abonelik-otomatik-yenileme", label: "Abonelik ve Yenileme" },
  { href: "/odeme-ve-faturalandirma", label: "Ödeme ve Faturalandırma" },
  { href: "/odeme-guvenligi", label: "Ödeme Güvenliği" },
  { href: "/dijital-teslimat", label: "Dijital Teslimat" },
  { href: "/guvenlik", label: "Güvenlik Politikası" },
  { href: "/destek-sikayet", label: "Destek ve Şikayet" },
  { href: "/uyusmazlik", label: "Uyuşmazlık Çözümü" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={outfit.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: SITE_NAME,
              url: SITE_URL,
              email: BUSINESS.email,
              telephone: BUSINESS.telefon,
              address: {
                "@type": "PostalAddress",
                streetAddress: BUSINESS.adres,
                addressLocality: "Çorlu",
                addressRegion: "Tekirdağ",
                addressCountry: "TR",
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              url: SITE_URL,
              name: SITE_NAME,
              potentialAction: {
                "@type": "SearchAction",
                target: `${SITE_URL}/?q={search_term_string}`,
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: SITE_NAME,
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              description: "Dilekçe nasıl yazılır, metin dönüştürücü, fatura itirazı, e-ticaret ürün açıklaması. AI destekli metin platformu.",
              offers: { "@type": "Offer", price: "0", priceCurrency: "TRY" },
            }),
          }}
        />
      </head>
      <body className="min-h-screen antialiased font-sans bg-slate-50">
        <ToastProvider>
          <PromoBanner />
          <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/95 shadow-[0_1px_0_0_rgba(0,0,0,.04)] backdrop-blur-xl">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-6 sm:py-4">
              <Link
                href="/"
                className="group flex shrink-0 items-center gap-2.5 text-base font-bold tracking-tight text-slate-900 transition hover:text-brand-600 sm:text-lg"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 text-white shadow-[0_4px_12px_-2px_rgba(5,150,105,.35)] transition group-hover:shadow-[0_6px_16px_-2px_rgba(5,150,105,.4)] sm:h-10 sm:w-10">
                  <Logo className="h-5 w-5 sm:h-6 sm:w-6" />
                </span>
                <span>{SITE_NAME}</span>
              </Link>
              <nav className="flex flex-wrap items-center justify-end gap-0.5 sm:gap-1" aria-label="Ana menü">
                {navLinks.slice(0, 3).map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className="rounded-lg px-3.5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-brand-50/80 hover:text-brand-700"
                  >
                    {label}
                  </Link>
                ))}
                <NavDropdown />
                {navLinks.slice(3).map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className="rounded-lg px-3.5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-brand-50/80 hover:text-brand-700"
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

          <footer className="border-t border-slate-200 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-slate-300 shadow-[0_-4px_24px_-4px_rgba(0,0,0,.1)]">
            <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
              <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-5">
                <div className="sm:col-span-2 lg:col-span-2">
                  <Link href="/" className="inline-flex items-center gap-2.5 text-white">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 shadow-[0_4px_12px_-2px_rgba(5,150,105,.4)]">
                      <Logo className="h-5 w-5" />
                    </span>
                    <span className="text-lg font-bold tracking-tight">{SITE_NAME}</span>
                  </Link>
                  <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
                    AI destekli metin üretim platformu. Fatura itirazı, dilekçe, pazarlık ve CV taslağı — bilgilendirme amaçlıdır, hukuki tavsiye değildir.
                  </p>
                  <p className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                    <span>🔒 SSL güvenli</span>
                    <span>🇹🇷 Türkiye&apos;de</span>
                  </p>
                  <div className="mt-4 text-xs text-slate-500">
                    <p className="font-semibold text-slate-300">{BUSINESS.unvan}</p>
                    <p>Vergi Dairesi: {BUSINESS.vergiDairesi} · VKN: {BUSINESS.vkn}</p>
                    <p>{BUSINESS.adres}</p>
                    <p>Tel: {BUSINESS.telefon} · {BUSINESS.email}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
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
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
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
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
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
