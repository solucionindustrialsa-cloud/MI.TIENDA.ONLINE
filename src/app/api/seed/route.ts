import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, settings } from "@/db/schema";

export async function POST() {
  try {
    // Check existing
    const existingProducts = await db.select().from(products);
    if (existingProducts.length === 0) {
      await db.insert(products).values([
        {
          name: "Botella Térmica Rosa Pastel 750ml",
          description: "Mantiene tus bebidas frías por 24h y calientes por 12h. Acero inoxidable, tapa a rosca, diseño minimalista con corazón grabado.",
          price: 1899000, // $18.990
          category: "botellas",
          stock: 12,
          imageUrl: "https://images.unsplash.com/photo-1523369364227-24934b335831?w=600",
        },
        {
          name: "Botella con Infusor de Frutas",
          description: "Botella deportiva con infusor para agregar frutas naturales. Libre de BPA, colores pastel.",
          price: 1299000,
          category: "botellas",
          stock: 20,
          imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600",
        },
        {
          name: "Bolso Tote Bag 'Cosas Lindas'",
          description: "Bolso amplio de lona premium, correas reforzadas. Ideal para todos los días, con bolsillo interno.",
          price: 2450000,
          category: "bolsos",
          stock: 8,
          imageUrl: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600",
        },
        {
          name: "Mini Bolso Cruzado Rosa",
          description: "Bolso pequeño con cadena dorada, forro interno. Perfecto para salidas, combina con todo.",
          price: 1999000,
          category: "bolsos",
          stock: 15,
          imageUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600",
        },
        {
          name: "Gorra Dad Cap Bordada",
          description: "Gorra de algodón con bordado 'love' en rosa pastel, regulable, unisex.",
          price: 990000,
          category: "gorras",
          stock: 25,
          imageUrl: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600",
        },
        {
          name: "Gorra Trucker Rosa & Blanco",
          description: "Estilo trucker con malla trasera, visera curva, logo caprichitos.",
          price: 1150000,
          category: "gorras",
          stock: 10,
          imageUrl: "https://images.unsplash.com/photo-1529391409740-59e01922c2d2?w=600",
        },
        {
          name: "Mochila Escolar Pastel",
          description: "Mochila impermeable con múltiples compartimentos, incluye cartuchera a juego. Resistente y liviana.",
          price: 3290000,
          category: "mochilas",
          stock: 6,
          imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600",
        },
        {
          name: "Mochila Urbana Minimalista",
          description: "Diseño urbano, compartimento para laptop 15', bolsillos ocultos, correas acolchadas.",
          price: 2850000,
          category: "mochilas",
          stock: 9,
          imageUrl: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=600",
        },
      ]);
    }

    const existingSettings = await db.select().from(settings);
    if (existingSettings.length === 0) {
      await db.insert(settings).values({
        storeName: "caprichitos_cosas_lindas",
        primaryColor: "#e91e63",
        secondaryColor: "#fce7f3",
        heroTitle: "Cosas lindas que te hacen feliz",
        heroSubtitle: "Descubrí nuestra colección exclusiva de botellas, bolsos, gorras y mochilas diseñadas para vos. Calidad premium con el toque rosa que amás.",
        heroImageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800",
        whatsappNumber: "5491123456789",
        contactEmail: "hola@caprichitos.com",
        contactPhone: "+54 11 2345-6789",
        address: "Buenos Aires, Argentina - Envíos a todo el país",
        instagram: "https://instagram.com/caprichitos_cosas_lindas",
        facebook: "https://facebook.com",
        aboutText: "Somos Caprichitos, una tienda hecha con amor para ofrecerte accesorios que combinan estilo, calidad y ternura.",
      });
    }

    return NextResponse.json({ success: true, message: "Seed completado" });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET() {
  return POST();
}
