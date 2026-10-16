import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Caprichitos - Cosas Lindas | Botellas, Bolsos, Gorras y Mochilas",
  description: "Tienda online de botellas, bolsos, gorras y mochilas. Diseño moderno y elegante. Envíos a todo el país.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased bg-white">{children}</body>
    </html>
  );
}
