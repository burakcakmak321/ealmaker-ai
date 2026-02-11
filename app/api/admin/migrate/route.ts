import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

const MIGRATION_SQL = `ALTER TABLE public.usage ADD COLUMN IF NOT EXISTS one_time_credits int NOT NULL DEFAULT 0;`;

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email || !ADMIN_EMAILS.includes(user.email.toLowerCase())) {
      return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });
    }

    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      return NextResponse.json(
        {
          error: "DATABASE_URL tanımlı değil.",
          instructions: [
            "1. Supabase Dashboard → Project Settings → Database",
            "2. Connection string (URI) kopyalayın (Transaction mode)",
            "3. Vercel/yerel .env'e DATABASE_URL=... ekleyin",
            "4. Bu isteği tekrar gönderin",
          ],
          sql: MIGRATION_SQL,
        },
        { status: 400 }
      );
    }

    const { default: pg } = await import("pg");
    const client = new pg.Client({ connectionString: databaseUrl });
    await client.connect();
    try {
      await client.query(MIGRATION_SQL);
      return NextResponse.json({ success: true, message: "one_time_credits sütunu eklendi." });
    } finally {
      await client.end();
    }
  } catch (err) {
    console.error("Migration error:", err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Migration hatası.",
        sql: MIGRATION_SQL,
      },
      { status: 500 }
    );
  }
}
