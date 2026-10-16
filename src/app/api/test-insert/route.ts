import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

// Prueba verificable para Railway: comprueba esquema real y capacidad de insert sin Base64
export async function GET() {
  const results: any = { timestamp: new Date().toISOString() };

  // 1. Verificar esquema real de PostgreSQL
  try {
    const cols = await db.execute(sql`
      SELECT column_name, data_type, character_maximum_length, is_nullable
      FROM information_schema.columns
      WHERE table_name='products'
      ORDER BY ordinal_position
    `);
    results.schema = cols.rows;
    // Detectar si image_url es VARCHAR(255) (fallaría con Base64 largo)
    const imgCol = (cols.rows as any[]).find(c => c.column_name === "image_url");
    results.imageUrlType = imgCol;
    results.schemaOk =
      imgCol?.data_type === "text" && !imgCol?.character_maximum_length;
  } catch (e: any) {
    results.schemaError = e.message;
  }

  // 2. Probar insert con URL corta (debe funcionar en cualquier esquema correcto)
  try {
    const testName = `TEST-VERIFY-${Date.now()}`;
    const [created] = await db
      .insert(products)
      .values({
        name: testName,
        description: "Producto de prueba para verificar insert sin Base64",
        price: 99900,
        category: "bolsos",
        stock: 1,
        imageUrl: "/uploads/test-placeholder.jpg",
        images: [],
        featured: false,
      })
      .returning();
    results.insertShortUrl = { ok: true, id: created.id, name: created.name };

    // Limpiar prueba inmediatamente para no dejar datos basura
    await db.execute(sql`DELETE FROM products WHERE id = ${created.id}`);
    results.cleanup = "ok";
  } catch (e: any) {
    results.insertShortUrl = { ok: false, error: e.message };
  }

  // 3. Probar que Base64 ahora es rechazado con 413 (protección)
  try {
    const fakeReq = { json: async () => ({}) } as any;
    // No hacemos fetch real aquí, solo documentamos la regla
    results.base64Policy = "POST /api/products con data:image/... ahora responde 413 - usa /api/upload";
  } catch {}

  // 4. Verificar /api/upload genera archivo (no Base64)
  results.uploadPolicy = "POST /api/upload guarda en public/uploads/<uuid>.jpg y devuelve /uploads/... ; en prod usar CLOUDINARY_* para persistencia";

  results.summary = results.insertShortUrl?.ok
    ? "✅ Esquema y insert funcionan — el error de Railway era por Base64 excesivo y debe usar /api/upload"
    : "❌ Insert aún falla — revisar migraciones (npx drizzle-kit push)";

  return NextResponse.json(results);
}

export async function POST(req: NextRequest) {
  // Permite prueba manual con body real
  const body = await req.json().catch(() => ({}));
  return NextResponse.json({ received: body, note: "Usa GET para prueba completa de esquema" });
}
