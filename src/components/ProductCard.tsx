"use client";
import { formatPrice } from "@/lib/utils";
import { useCart } from "./CartContext";

export default function ProductCard({ product, whatsappNumber }: { product: any; whatsappNumber: string }) {
  const { addItem } = useCart();

  const handleWhatsApp = () => {
    const text = `Hola! Me interesa este producto: *${product.name}* - ${formatPrice(product.price)}%0A${product.description}%0A¿Sigue disponible?`;
    const url = `https://wa.me/${whatsappNumber}?text=${text}`;
    window.open(url, "_blank");
  };

  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-pink-100 hover:shadow-xl hover:shadow-pink-100 transition-all duration-300 flex flex-col">
      <div className="relative overflow-hidden bg-gradient-to-b from-pink-50 to-white h-64">
        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold capitalize border border-pink-100">
          {product.category}
        </div>
        {product.stock <= 3 && product.stock > 0 && (
          <div className="absolute top-3 right-3 bg-amber-400 text-white px-3 py-1 rounded-full text-xs font-bold">¡Últimas {product.stock}!</div>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-white/70 grid place-items-center backdrop-blur-sm"><span className="bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-bold">AGOTADO</span></div>
        )}
      </div>
      <div className="p-5 flex flex-col flex-1 gap-3">
        <h3 className="font-semibold text-gray-900 leading-tight line-clamp-2" style={{ fontFamily: "Playfair Display, serif" }}>{product.name}</h3>
        <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{product.description}</p>
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div>
            <p className="text-xl font-bold text-[#e91e63]">{formatPrice(product.price)}</p>
            <p className="text-xs text-gray-400">Stock: {product.stock} u.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleWhatsApp} className="w-10 h-10 rounded-full bg-green-500 text-white grid place-items-center hover:bg-green-600 transition" title="Consultar por WhatsApp">💬</button>
            <button
              disabled={product.stock === 0}
              onClick={() => addItem({ id: product.id, name: product.name, price: product.price, imageUrl: product.imageUrl, quantity: 1 })}
              className="px-4 py-2.5 rounded-full bg-[#e91e63] text-white text-sm font-semibold hover:bg-[#c2185b] disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-2"
            >
              <span>Agregar</span> <span>＋</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
