import { NextResponse } from "next/server";

const SITE_URL = "https://xn--yaziasistani-izb.com";

const ROUTES = [
  "/",
  "/e-ticaret",
  "/sosyal-medya",
  "/blog-seo",
  "/metin-donusturucu",
  "/fatura",
  "/pazarlik",
  "/dilekce",
  "/cv",
  "/fiyatlandirma",
  "/giris",
  "/sss",
  "/iletisim",
  "/hakkimizda",
  "/gizlilik",
  "/kullanim",
  "/mesafeli-satis",
  "/on-bilgilendirme",
  "/cerezler",
  "/iade-iptal",
  "/abonelik-otomatik-yenileme",
  "/odeme-ve-faturalandirma",
  "/odeme-guvenligi",
  "/dijital-teslimat",
  "/guvenlik",
  "/destek-sikayet",
  "/uyusmazlik",
  "/premium-yakinda",
];

const HIGH_PRIORITY = ["/", "/e-ticaret", "/sosyal-medya", "/blog-seo", "/metin-donusturucu", "/fatura", "/dilekce", "/cv", "/fiyatlandirma"];

function toXmlUrl(path: string): string {
  const priority = path === "/" ? "1.0" : HIGH_PRIORITY.includes(path) ? "0.9" : "0.6";
  return `  <url>\n    <loc>${SITE_URL}${path}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}

export async function GET() {
  const urls = ROUTES.map(toXmlUrl).join("\n");
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}