import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { isAdminAuthenticated } from "@/lib/auth";

export async function GET() {
  const all = await db.select().from(products).orderBy(products.id);
  return NextResponse.json(all);
}

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { name, description, price, category, stock, imageUrl, images, featured } = body;
    if (!name || !price || !category || !imageUrl) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }
    const [created] = await db.insert(products).values({
      name,
      description: description || "",
      price: Number(price),
      category,
      stock: Number(stock) || 10,
      imageUrl,
      images: images || [],
      featured: !!featured,
    }).returning();
    return NextResponse.json(created);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
