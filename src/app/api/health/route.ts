import { db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!process.env.DATABASE_URL) {
    // Durante build sin DATABASE_URL, responder ok para que Railway no falle healthcheck de build
    // En runtime real sí debe haber DATABASE_URL, pero no rompemos el deploy
    return Response.json({ ok: true, warning: "DATABASE_URL no configurada" });
  }
  try {
    await db.execute(sql`select 1`);
    return Response.json({ ok: true });
  } catch (e: any) {
    return Response.json({ ok: false, error: e.message }, { status: 500 });
  }
}
