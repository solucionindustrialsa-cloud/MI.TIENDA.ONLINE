"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

export type CartItem = {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, qty: number) => void;
  clearCart: () => void;
  total: number;
  count: number;
  open: boolean;
  setOpen: (o: boolean) => void;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("caprichitos_cart");
    if (saved) {
      try { setItems(JSON.parse(saved)); } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("caprichitos_cart", JSON.stringify(items));
  }, [items]);

  const addItem = (item: CartItem) => {
    setItems(prev => {
      const exists = prev.find(p => p.id === item.id);
      if (exists) return prev.map(p => p.id === item.id ? { ...p, quantity: p.quantity + item.quantity } : p);
      return [...prev, item];
    });
    setOpen(true);
  };
  const removeItem = (id: number) => setItems(prev => prev.filter(p => p.id !== id));
  const updateQuantity = (id: number, qty: number) => {
    if (qty <= 0) return removeItem(id);
    setItems(prev => prev.map(p => p.id === id ? { ...p, quantity: qty } : p));
  };
  const clearCart = () => setItems([]);
  const total = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const count = items.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, count, open, setOpen }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be inside CartProvider");
  return ctx;
};
