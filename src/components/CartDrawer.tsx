"use client";
import { useCart } from "./CartContext";
import { formatPrice } from "@/lib/utils";
import { useState } from "react";

export default function CartDrawer({ whatsappNumber }: { whatsappNumber: string }) {
  const { items, open, setOpen, updateQuantity, removeItem, total, clearCart } = useCart();
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!open) return null;

  const handleWhatsAppOrder = () => {
    if (items.length === 0) return;
    const lines = items.map(i => `• ${i.name} x${i.quantity} - ${formatPrice(i.price * i.quantity)}`).join("%0A");
    const totalStr = formatPrice(total);
    const msg = `Hola Caprichitos! 💖 Quiero hacer el siguiente pedido:%0A%0A${lines}%0A%0ATotal: *${totalStr}*%0A%0ANombre: ${customerName || " - "}%0ATel: ${customerPhone || " - "}%0ADirección: ${customerAddress || " - "}`;
    window.open(`https://wa.me/${whatsappNumber}?text=${msg}`, "_blank");
  };

  const handleCreateOrder = async () => {
    if (!customerName || !customerPhone) {
      alert("Completá nombre y teléfono");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerPhone,
          customerAddress,
          items,
          total,
        }),
      });
      if (!res.ok) throw new Error("Error al crear pedido");
      setSuccess(true);
      handleWhatsAppOrder();
      setTimeout(() => { clearCart(); setSuccess(false); setOpen(false); }, 1200);
    } catch (e: any) {
      alert(e.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col">
        <div className="p-6 border-b border-pink-100 flex items-center justify-between bg-gradient-to-r from-pink-50 to-white">
          <h2 className="text-xl font-bold" style={{ fontFamily: "Playfair Display, serif" }}>Tu carrito ({items.length})</h2>
          <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-full bg-white border border-pink-200 grid place-items-center">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-5xl mb-4">🛍️</p>
              <p className="text-gray-500">Tu carrito está vacío</p>
              <p className="text-sm text-gray-400 mt-1">Agregá productos para comenzar tu pedido</p>
              <button onClick={() => setOpen(false)} className="mt-6 px-6 py-2 rounded-full bg-[#e91e63] text-white text-sm font-semibold">Ver catálogo</button>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="flex gap-3 p-3 rounded-2xl border border-pink-100 bg-pink-50/50">
                <img src={item.imageUrl} alt={item.name} className="w-20 h-20 rounded-xl object-cover bg-white" />
                <div className="flex-1">
                  <h4 className="font-semibold text-sm leading-tight">{item.name}</h4>
                  <p className="text-[#e91e63] font-bold text-sm">{formatPrice(item.price)}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-7 h-7 rounded-full bg-white border border-pink-200 grid place-items-center text-sm">−</button>
                    <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 rounded-full bg-white border border-pink-200 grid place-items-center text-sm">＋</button>
                    <button onClick={() => removeItem(item.id)} className="ml-auto text-xs text-gray-500 hover:text-red-500">Eliminar</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t border-pink-100 bg-white space-y-4">
            <div className="space-y-2">
              <input placeholder="Tu nombre *" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full px-4 py-2.5 rounded-full border border-pink-200 outline-none focus:border-[#e91e63] text-sm" />
              <input placeholder="WhatsApp *" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full px-4 py-2.5 rounded-full border border-pink-200 outline-none focus:border-[#e91e63] text-sm" />
              <input placeholder="Dirección (opcional)" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} className="w-full px-4 py-2.5 rounded-full border border-pink-200 outline-none focus:border-[#e91e63] text-sm" />
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span><span className="text-[#e91e63]">{formatPrice(total)}</span>
            </div>
            {success && <p className="text-green-600 text-sm text-center font-medium">¡Pedido registrado! Te redirigimos a WhatsApp...</p>}
            <button onClick={handleCreateOrder} disabled={loading} className="w-full py-3 rounded-full bg-[#e91e63] text-white font-bold hover:bg-[#c2185b] disabled:opacity-50 transition flex items-center justify-center gap-2">
              {loading ? "Procesando..." : "Confirmar pedido"} <span>→</span>
            </button>
            <button onClick={handleWhatsAppOrder} className="w-full py-3 rounded-full bg-green-500 text-white font-semibold hover:bg-green-600 transition flex items-center justify-center gap-2">
              <span>💬</span> Pedir por WhatsApp
            </button>
            <p className="text-[11px] text-center text-gray-400">Al confirmar también se guarda el pedido en el panel admin</p>
          </div>
        )}
      </div>
    </div>
  );
}
