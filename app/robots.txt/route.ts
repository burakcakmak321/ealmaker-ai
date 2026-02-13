import { NextResponse } from "next/server";

export async function GET() {
  const body = `User-agent: *
Allow: /

Sitemap: https://yazıasistani.com/sitemap.xml
`;
  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}