import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return NextResponse.json({
    hasUrl,
    hasKey,
    ok: hasUrl && hasKey,
    hint: !hasUrl || !hasKey
      ? "Vercel'de dogru PROJE'ye girdiginden emin ol. URL: ealmakerai.vercel.app olan proje."
      : null,
  });
}
