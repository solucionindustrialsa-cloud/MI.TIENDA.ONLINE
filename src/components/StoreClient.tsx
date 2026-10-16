"use client";
import { useState, useMemo } from "react";
import StoreHeader from "./StoreHeader";
import ProductCard from "./ProductCard";
import CartDrawer from "./CartDrawer";
import { CartProvider } from "./CartContext";
import { formatPrice } from "@/lib/utils";

const categories = [
  { id: "todos", label: "Todos", emoji: "✨" },
  { id: "botellas", label: "Botellas", emoji: "🧴" },
  { id: "bolsos", label: "Bolsos", emoji: "👜" },
  { id: "gorras", label: "Gorras", emoji: "🧢" },
  { id: "mochilas", label: "Mochilas", emoji: "🎒" },
];

function StoreInner({ products, settings }: { products: any[]; settings: any }) {
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("todos");

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchCat = cat === "todos" || p.category === cat;
      const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [products, cat, search]);

  return (
    <>
      <StoreHeader settings={settings} onSearch={setSearch} />
      <CartDrawer whatsappNumber={settings.whatsappNumber} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#fce7f3] via-[#f9a8d4]/30 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 grid lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 bg-white border border-pink-200 px-4 py-1.5 rounded-full text-xs font-semibold text-[#e91e63]">💖 NUEVA COLECCIÓN 2026</span>
            <h2 className="text-4xl lg:text-5xl font-bold leading-tight text-gray-900" style={{ fontFamily: "Playfair Display, serif" }}>
              {settings.heroTitle}
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed max-w-xl">{settings.heroSubtitle}</p>
            <div className="flex flex-wrap gap-3">
              <a href="#catalogo" className="px-8 py-3 rounded-full bg-[#e91e63] text-white font-semibold hover:bg-[#c2185b] transition shadow-lg shadow-pink-200">Ver catálogo</a>
              <a href={`https://wa.me/${settings.whatsappNumber}`} target="_blank" className="px-8 py-3 rounded-full bg-white border border-pink-200 font-semibold hover:bg-pink-50 transition flex items-center gap-2"><span>💬</span> WhatsApp</a>
            </div>
            <div className="flex gap-6 pt-4">
              <div><p className="text-2xl font-bold text-[#e91e63]">+1000</p><p className="text-xs text-gray-500">clientas felices</p></div>
              <div className="w-px bg-pink-200" />
              <div><p className="text-2xl font-bold text-[#e91e63]">4.9★</p><p className="text-xs text-gray-500">valoraciones</p></div>
              <div className="w-px bg-pink-200" />
              <div><p className="text-2xl font-bold text-[#e91e63]">Envíos</p><p className="text-xs text-gray-500">a todo el país</p></div>
            </div>
          </div>
          <div className="relative">
            <div className="rounded-[2.5rem] overflow-hidden shadow-2xl rotate-1 bg-white p-2">
              <img src={settings.heroImageUrl || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800"} alt="hero" className="rounded-[2rem] w-full h-[380px] lg:h-[460px] object-cover" />
            </div>
            <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-4 shadow-xl border border-pink-100 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-pink-100 grid place-items-center">🎒</div>
              <div><p className="font-bold text-sm">Mochilas premium</p><p className="text-xs text-gray-500">desde {products.length ? formatPrice(Math.min(...products.map(p=>p.price))) : "$15.000"}</p></div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="catalogo" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold" style={{ fontFamily: "Playfair Display, serif" }}>Nuestro catálogo</h3>
          <p className="text-sm text-gray-500 hidden sm:block">{filtered.length} productos • Envíos en 24hs</p>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          {categories.map(c => (
            <button key={c.id} onClick={() => setCat(c.id)} className={`flex-shrink-0 px-6 py-3 rounded-full font-semibold text-sm flex items-center gap-2 transition ${cat === c.id ? "bg-[#e91e63] text-white shadow-lg shadow-pink-200" : "bg-white border border-pink-200 text-gray-700 hover:bg-pink-50"}`}>
              <span>{c.emoji}</span>{c.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-pink-50 rounded-3xl mt-6 border border-pink-100">
            <p className="text-gray-500">No encontramos productos para "{search}" en {cat}</p>
            <button onClick={() => { setSearch(""); setCat("todos"); }} className="mt-4 text-[#e91e63] font-semibold underline">Limpiar filtros</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
            {filtered.map(p => <ProductCard key={p.id} product={p} whatsappNumber={settings.whatsappNumber} />)}
          </div>
        )}
      </section>

      {/* Trust */}
      <section className="bg-[#fdf2f8] border-y border-pink-100 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid sm:grid-cols-3 gap-6 text-center">
          <div><p className="text-2xl">🚚</p><p className="font-bold mt-2">Envíos a todo el país</p><p className="text-sm text-gray-500">Correo Argentino y moto en CABA</p></div>
          <div><p className="text-2xl">💳</p><p className="font-bold mt-2">Pagos seguros</p><p className="text-sm text-gray-500">Transferencia, efectivo y cuotas</p></div>
          <div><p className="text-2xl">💬</p><p className="font-bold mt-2">Atención por WhatsApp</p><p className="text-sm text-gray-500">Respondemos en minutos</p></div>
        </div>
      </section>

      {/* Contact */}
      <section id="contacto" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gradient-to-br from-[#e91e63] to-[#ad1457] rounded-[2rem] p-8 lg:p-10 text-white flex flex-col lg:flex-row justify-between gap-8">
          <div>
            <h3 className="text-2xl font-bold" style={{ fontFamily: "Playfair Display, serif" }}>¿Dudas? ¡Escribinos!</h3>
            <p className="text-pink-100 mt-2 max-w-md">Estamos para ayudarte. Respondemos por WhatsApp, Instagram o mail en horario comercial.</p>
            <div className="mt-6 space-y-2 text-sm">
              <p>📧 {settings.contactEmail}</p>
              <p>📞 {settings.contactPhone}</p>
              <p>📍 {settings.address}</p>
            </div>
          </div>
          <div className="flex flex-col gap-3 lg:items-end justify-center">
            <a href={`https://wa.me/${settings.whatsappNumber}`} target="_blank" className="px-8 py-3 rounded-full bg-white text-[#e91e63] font-bold hover:bg-pink-50 transition text-center">💬 Hablar por WhatsApp</a>
            <div className="flex gap-3 justify-center">
              <a href={settings.instagram} target="_blank" className="w-10 h-10 rounded-full bg-white/20 grid place-items-center hover:bg-white/30">📸</a>
              <a href={settings.facebook} target="_blank" className="w-10 h-10 rounded-full bg-white/20 grid place-items-center hover:bg-white/30">📘</a>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-pink-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between gap-4 text-sm text-gray-500">
          <p>© 2026 {settings.storeName} • Hecho con 💖 en Argentina</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-[#e91e63]">Términos</a>
            <a href="#" className="hover:text-[#e91e63]">Privacidad</a>
            <a href="/admin" className="hover:text-[#e91e63] font-semibold underline">Panel Admin ↓</a>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-600">🔒 <b>Acceso administrador:</b> El panel está abierto sin contraseña por defecto. Configurá ADMIN_PASSWORD en variables de entorno para protegerlo.</p>
            <a href="/admin" className="px-5 py-2 rounded-full bg-gray-900 text-white text-xs font-bold hover:bg-black">Ir al panel →</a>
          </div>
        </div>
      </footer>

      {/* WhatsApp floating */}
      <a href={`https://wa.me/${settings.whatsappNumber}?text=Hola%20Caprichitos!%20Quiero%20consultar%20por%20un%20producto`} target="_blank" className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-green-500 text-white grid place-items-center shadow-xl hover:bg-green-600 transition z-30 text-2xl">
        💬
      </a>
    </>
  );
}

export default function StoreClient({ products, settings }: { products: any[]; settings: any }) {
  return (
    <CartProvider>
      <StoreInner products={products} settings={settings} />
    </CartProvider>
  );
}
