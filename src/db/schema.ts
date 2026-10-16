import { pgTable, serial, varchar, text, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(), // in cents
  category: varchar("category", { length: 50 }).notNull(),
  stock: integer("stock").notNull().default(10),
  imageUrl: text("image_url").notNull(),
  images: jsonb("images").$type<string[]>().default([]),
  featured: boolean("featured").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerName: varchar("customer_name", { length: 255 }).notNull(),
  customerPhone: varchar("customer_phone", { length: 50 }).notNull(),
  customerAddress: text("customer_address"),
  customerNotes: text("customer_notes"),
  items: jsonb("items").$type<{ id: number; name: string; price: number; quantity: number; imageUrl: string }[]>().notNull(),
  total: integer("total").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pendiente"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  storeName: varchar("store_name", { length: 255 }).notNull().default("caprichitos_cosas_lindas"),
  logoUrl: text("logo_url"),
  primaryColor: varchar("primary_color", { length: 20 }).notNull().default("#e91e63"),
  secondaryColor: varchar("secondary_color", { length: 20 }).notNull().default("#fce7f3"),
  heroTitle: varchar("hero_title", { length: 255 }).notNull().default("Cosas lindas que te hacen feliz"),
  heroSubtitle: text("hero_subtitle").notNull().default("Descubrí nuestra colección exclusiva de botellas, bolsos, gorras y mochilas diseñadas para vos."),
  heroImageUrl: text("hero_image_url"),
  whatsappNumber: varchar("whatsapp_number", { length: 30 }).notNull().default("5491123456789"),
  contactEmail: varchar("contact_email", { length: 255 }).notNull().default("hola@caprichitos.com"),
  contactPhone: varchar("contact_phone", { length: 50 }).notNull().default("+54 11 2345-6789"),
  address: varchar("address", { length: 255 }).notNull().default("Buenos Aires, Argentina"),
  instagram: varchar("instagram", { length: 255 }).default("https://instagram.com"),
  facebook: varchar("facebook", { length: 255 }).default("https://facebook.com"),
  aboutText: text("about_text").default("Somos Caprichitos, una tienda dedicada a ofrecerte los accesorios más lindos y funcionales."),
  updatedAt: timestamp("updated_at").defaultNow(),
});
