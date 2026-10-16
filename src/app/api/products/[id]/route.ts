import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { isAdminAuthenticated } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product] = await db.select().from(products).where(eq(products.id, Number(id)));
  if (!product) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json();

  // Validar no guardar Base64 directo también en PUT
  if (body.imageUrl && typeof body.imageUrl === "string" && body.imageUrl.startsWith("data:")) {
    return NextResponse.json(
      { error: "Usa /api/upload para imágenes. No envíes data:image/... directo." },
      { status: 413 }
    );
  }

  const update: any = {};
  if (body.name !== undefined) update.name = body.name;
  if (body.description !== undefined) update.description = body.description;
  if (body.price !== undefined) update.price = Number(body.price);
  if (body.category !== undefined) update.category = body.category;
  if (body.stock !== undefined) update.stock = Number(body.stock);
  if (body.imageUrl !== undefined) update.imageUrl = body.imageUrl;
  if (body.images !== undefined) update.images = body.images;
  if (body.featured !== undefined) update.featured = !!body.featured;
  update.updatedAt = new Date();

  try {
    const [updated] = await db.update(products).set(update).where(eq(products.id, Number(id))).returning();
    if (!updated) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (e: any) {
    console.error("Failed query update products:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id } = await params;
  await db.delete(products).where(eq(products.id, Number(id)));
  return NextResponse.json({ success: true });
}
