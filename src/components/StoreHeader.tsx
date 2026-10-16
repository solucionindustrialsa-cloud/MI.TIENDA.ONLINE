"use client";
import { useCart } from "./CartContext";
import { useState } from "react";

export default function StoreHeader({ settings, onSearch }: { settings: any; onSearch: (q: string) => void }) {
  const { count, setOpen } = useCart();
  const [query, setQuery] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-pink-100">
      <div className="bg-[#e91e63] text-white text-center py-2 text-sm font-medium tracking-wide">
        ✨ Envíos gratis en compras superiores a $50.000 • 3 cuotas sin interés ✨
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <div className="flex items-center gap-3">
            {settings?.logoUrl ? (
              <img src={settings.logoUrl} alt="logo" className="w-10 h-10 rounded-full object-cover border border-pink-200 bg-white" />
            ) : (
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ background: settings?.primaryColor || "#e91e63" }}>
                C
              </div>
            )}
            <div>
              <h1 className="font-bold text-lg leading-none tracking-tight" style={{ fontFamily: "Playfair Display, serif" }}>{settings?.storeName || "caprichitos_cosas_lindas"}</h1>
              <p className="text-[11px] text-gray-500 tracking-widest uppercase">Cosas lindas para vos</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
            <a href="#" className="hover:text-[#e91e63]">Inicio</a>
            <a href="#catalogo" className="hover:text-[#e91e63]">Catálogo</a>
            <a href="#contacto" className="hover:text-[#e91e63]">Contacto</a>
            <a href="/admin" className="text-xs bg-gray-100 px-3 py-1.5 rounded-full hover:bg-pink-50">Admin</a>
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center bg-pink-50 rounded-full px-4 py-2 w-64 border border-pink-100">
              <input
                value={query}
                onChange={e => { setQuery(e.target.value); onSearch(e.target.value); }}
                placeholder="Buscar botellas, bolsos..."
                className="bg-transparent outline-none text-sm w-full placeholder:text-gray-400"
              />
              <span className="text-pink-400">⌕</span>
            </div>
            <button onClick={() => setOpen(true)} className="relative p-2.5 rounded-full bg-[#e91e63] text-white hover:bg-[#c2185b] transition">
              <span className="text-lg">🛒</span>
              {count > 0 && <span className="absolute -top-1 -right-1 bg-white text-[#e91e63] text-[11px] font-bold w-5 h-5 grid place-items-center rounded-full border border-pink-200">{count}</span>}
            </button>
            <button className="md:hidden p-2" onClick={() => setMobileMenu(!mobileMenu)}>☰</button>
          </div>
        </div>
        {mobileMenu && (
          <div className="md:hidden pb-4 flex flex-col gap-2">
            <input
              value={query}
              onChange={e => { setQuery(e.target.value); onSearch(e.target.value); }}
              placeholder="Buscar..."
              className="bg-pink-50 border border-pink-100 rounded-full px-4 py-2 text-sm outline-none"
            />
            <a href="#catalogo" className="py-2 text-sm">Catálogo</a>
            <a href="/admin" className="py-2 text-sm">Panel Admin</a>
          </div>
        )}
      </div>
    </header>
  );
}
