import { db } from "@/db";
import { products, settings } from "@/db/schema";
import StoreClient from "@/components/StoreClient";

export const dynamic = "force-dynamic";

const fallbackSettings = {
  storeName: "caprichitos_cosas_lindas",
  logoUrl: null,
  primaryColor: "#e91e63",
  secondaryColor: "#fce7f3",
  heroTitle: "Cosas lindas que te hacen feliz",
  heroSubtitle:
    "Descubrí nuestra colección exclusiva de botellas, bolsos, gorras y mochilas diseñadas para vos.",
  heroImageUrl: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800",
  whatsappNumber: "5491123456789",
  contactEmail: "hola@caprichitos.com",
  contactPhone: "+54 11 2345-6789",
  address: "Buenos Aires, Argentina",
  instagram: "https://instagram.com",
  facebook: "https://facebook.com",
  aboutText: "",
};

export default async function Home() {
  // Si DATABASE_URL no está configurada (build en Railway sin plugin), no romper el build
  if (!process.env.DATABASE_URL) {
    console.warn("DATABASE_URL no configurada - mostrando datos de fallback");
    return <StoreClient products={[]} settings={fallbackSettings} />;
  }

  try {
    const allProducts = await db.select().from(products).orderBy(products.id);
    const allSettings = await db.select().from(settings).limit(1);
    const siteSettings = allSettings[0] || fallbackSettings;

    return <StoreClient products={allProducts} settings={siteSettings} />;
  } catch (e) {
    console.error("Error cargando datos de la BD, usando fallback:", e);
    return <StoreClient products={[]} settings={fallbackSettings} />;
  }
}
