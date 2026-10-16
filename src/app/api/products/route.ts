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

    // Validación crítica: rechazar Base64 directo en BD (causa "Failed query" en producción)
    // La imagen debe venir de /uploads/... o https:// (Cloudinary u otra URL)
    if (typeof imageUrl === "string" && imageUrl.startsWith("data:")) {
      // Log para debug, pero responder con error claro en lugar de fallo silencioso de PG
      console.error("Intento de insert con Base64 directo (", imageUrl.length, " chars) — usar /api/upload primero");
      return NextResponse.json(
        {
          error:
            "La imagen es demasiado grande para la base de datos. Sube el archivo vía /api/upload y usa la URL corta (/uploads/xxx). No envíes data:image/... directo.",
        },
        { status: 413 }
      );
    }

    // Defensa adicional: si imageUrl es extremadamente largo, rechazar temprano
    if (typeof imageUrl === "string" && imageUrl.length > 2000 && imageUrl.includes("base64")) {
      return NextResponse.json({ error: "imageUrl Base64 detectado — usa subida de archivo" }, { status: 413 });
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
    // Mapear errores comunes de Postgres a mensaje útil
    console.error("Failed query insert products:", e);
    // Si es error de columna faltante (migración no aplicada en Railway), dar pista
    const msg = e.message || "Error desconocido";
    if (msg.includes("column") && msg.includes("does not exist")) {
      return NextResponse.json(
        {
          error: `Error de esquema: ${msg}. Ejecuta 'npx drizzle-kit push' en Railway para sincronizar la BD con schema.ts`,
          details: msg,
        },
        { status: 500 }
      );
    }
    return NextResponse.json({ error: msg, details: msg }, { status: 500 });
  }
}
