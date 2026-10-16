"use client";
import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";
import ImagePicker from "@/components/ImagePicker";

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  imageUrl: string;
  featured?: boolean;
};

type Order = {
  id: number;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: any[];
  total: number;
  status: string;
  createdAt: string;
};

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState<"productos" | "pedidos" | "config" | "stats" | "biblioteca">("productos");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: "", description: "", price: "", category: "botellas", stock: "10", imageUrl: "", featured: false });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [library, setLibrary] = useState<string[]>([]);
  const [deleteMode, setDeleteMode] = useState(false);

  useEffect(() => {
    fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) })
      .then(r => {
        if (r.ok) {
          setAuthed(true);
          loadData();
        } else {
          return r.json().then(() => setRequiresPassword(true));
        }
      })
      .catch(() => setRequiresPassword(true))
      .finally(() => setChecking(false));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
    if (res.ok) {
      setAuthed(true);
      loadData();
    } else {
      alert("Contraseña incorrecta");
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [pRes, oRes, sRes] = await Promise.all([fetch("/api/products", { cache: "no-store" }), fetch("/api/orders", { cache: "no-store" }), fetch("/api/settings", { cache: "no-store" })]);
      const pData = await pRes.json();
      const oData = await oRes.json();
      const sData = await sRes.json();
      setProducts(Array.isArray(pData) ? pData : []);
      setOrders(Array.isArray(oData) ? oData : []);
      setSettings(sData || { storeName: "caprichitos_cosas_lindas", primaryColor: "#e91e63", secondaryColor: "#fce7f3", heroTitle: "Cosas lindas que te hacen feliz", heroSubtitle: "", heroImageUrl: "", whatsappNumber: "", contactEmail: "", contactPhone: "", address: "", instagram: "", facebook: "" });

      // biblioteca = todas las imágenes de productos + hero/logo
      const imgs: string[] = [];
      if (Array.isArray(pData)) pData.forEach((p: any) => p.imageUrl && imgs.push(p.imageUrl));
      if (sData?.heroImageUrl) imgs.push(sData.heroImageUrl);
      if (sData?.logoUrl) imgs.push(sData.logoUrl);
      setLibrary(imgs);

      if (!pData || pData.length === 0) {
        await fetch("/api/seed", { method: "POST" });
        const after = await fetch("/api/products").then(r => r.json());
        if (Array.isArray(after)) {
          setProducts(after);
          setLibrary(after.map((p: any) => p.imageUrl).filter(Boolean));
        }
      }
    } finally { setLoading(false); }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.imageUrl) {
      alert("Elegí una imagen de tu biblioteca / galería primero 📁");
      return;
    }
    if (!form.name || !form.price) {
      alert("Completá nombre y precio");
      return;
    }
    setSaving(true);
    const payload = { name: form.name, description: form.description, price: Math.round(parseFloat(form.price) * 100), category: form.category, stock: parseInt(form.stock) || 0, imageUrl: form.imageUrl, featured: form.featured };
    try {
      const res = editing
        ? await fetch(`/api/products/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
        : await fetch("/api/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al guardar");
      }
      setMessage(editing ? "✅ Producto actualizado y guardado en BD" : "✅ Producto creado y guardado en BD");
      setTimeout(() => setMessage(""), 3000);
      setShowProductForm(false);
      setEditing(null);
      setForm({ name: "", description: "", price: "", category: "botellas", stock: "10", imageUrl: "", featured: false });
      await loadData();
    } catch (err: any) {
      alert(err.message);
    } finally { setSaving(false); }
  };

  const handleEdit = (p: Product) => {
    setEditing(p);
    setForm({ name: p.name, description: p.description, price: (p.price / 100).toString(), category: p.category, stock: p.stock.toString(), imageUrl: p.imageUrl, featured: !!p.featured });
    setShowProductForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar producto? Esta acción es permanente y se guarda en la base de datos.")) return;
    try {
      // Optimista: quitar de UI al instante
      setProducts(prev => prev.filter(p => p.id !== id));
      const res = await fetch(`/api/products/${id}`, { method: "DELETE", cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "No se pudo eliminar");
      setMessage("🗑️ Producto eliminado y guardado en BD");
      setTimeout(() => setMessage(""), 2500);
      // Recargar desde BD para confirmar
      await loadData();
    } catch (e: any) {
      alert("Error al eliminar: " + e.message);
      await loadData();
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    const res = await fetch("/api/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings) });
    if (res.ok) {
      setMessage("✅ Configuración guardada correctamente (colores, logo, hero, WhatsApp)");
      loadData();
    } else alert("Error al guardar configuración");
    setSaving(false);
    setTimeout(() => setMessage(""), 3000);
  };

  const updateOrderStatus = async (id: number, status: string) => {
    await fetch(`/api/orders/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    loadData();
  };

  const handleLibraryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (data.url) {
      setMessage("📸 Imagen subida a biblioteca y lista para usar en productos");
      setTimeout(() => setMessage(""), 2500);
      setLibrary(prev => [data.url, ...prev]);
    }
  };

  if (checking) return <div className="min-h-screen grid place-items-center bg-pink-50">Cargando panel...</div>;

  if (!authed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white grid place-items-center p-4">
        <form onSubmit={handleLogin} className="bg-white rounded-3xl p-8 shadow-xl border border-pink-100 w-full max-w-md space-y-6">
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-[#e91e63] text-white grid place-items-center mx-auto text-xl">🔒</div>
            <h1 className="text-2xl font-bold mt-4" style={{ fontFamily: "Playfair Display, serif" }}>Panel Administrador</h1>
            <p className="text-sm text-gray-500 mt-1">Caprichitos - Cosas Lindas</p>
            {requiresPassword ? <p className="text-xs text-amber-600 mt-2 bg-amber-50 p-2 rounded-xl">Se requiere contraseña (ADMIN_PASSWORD)</p> : <p className="text-xs text-green-600 mt-2 bg-green-50 p-2 rounded-xl">Acceso libre - sin contraseña configurada</p>}
          </div>
          {requiresPassword && <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-full border border-pink-200 outline-none focus:border-[#e91e63]" />}
          <button className="w-full py-3 rounded-full bg-[#e91e63] text-white font-bold hover:bg-[#c2185b]">{requiresPassword ? "Ingresar" : "Entrar al panel"}</button>
          <a href="/" className="block text-center text-sm text-gray-500 hover:text-[#e91e63]">← Volver a la tienda</a>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdf2f8]">
      <header className="bg-white border-b border-pink-100 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#e91e63] text-white grid place-items-center font-bold">C</div>
            <div><h1 className="font-bold leading-none">Panel Admin</h1><p className="text-xs text-gray-500">caprichitos_cosas_lindas</p></div>
          </div>
          <div className="flex items-center gap-2">
            <a href="/" className="px-4 py-2 rounded-full border border-pink-200 text-sm hover:bg-pink-50">Ver tienda</a>
            <button onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); setAuthed(false); }} className="px-4 py-2 rounded-full bg-gray-900 text-white text-sm">Salir</button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {message && <div className="bg-green-500 text-white px-4 py-3 rounded-2xl text-sm font-medium mb-4 animate-pulse">{message}</div>}

        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6">
          {[
            { id: "productos", label: `Productos (${products.length})`, icon: "📦" },
            { id: "biblioteca", label: "Biblioteca", icon: "🖼️" },
            { id: "pedidos", label: `Pedidos (${orders.length})`, icon: "🧾" },
            { id: "config", label: "Configuración", icon: "⚙️" },
            { id: "stats", label: "Estadísticas", icon: "📊" },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as any)} className={`px-5 py-3 rounded-full font-semibold text-sm whitespace-nowrap flex items-center gap-2 ${tab === t.id ? "bg-[#e91e63] text-white shadow" : "bg-white border border-pink-100"}`}>
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>

        {tab === "productos" && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-pink-100 flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
              <div><h2 className="text-xl font-bold">Productos</h2><p className="text-sm text-gray-500">Todo se guarda automáticamente en PostgreSQL. Agregar o quitar productos es permanente.</p></div>
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => { setEditing(null); setForm({ name: "", description: "", price: "", category: "botellas", stock: "10", imageUrl: "", featured: false }); setShowProductForm(true); setDeleteMode(false); }} className="px-6 py-3 rounded-full bg-[#e91e63] text-white font-bold hover:bg-[#c2185b]">＋ Agregar producto</button>
                <button onClick={() => setDeleteMode(!deleteMode)} className={`px-6 py-3 rounded-full font-bold border-2 ${deleteMode ? "bg-red-500 text-white border-red-500" : "bg-white text-red-600 border-red-200 hover:bg-red-50"}`}>{deleteMode ? "✕ Cancelar eliminación" : "🗑️ Eliminar producto"}</button>
              </div>
            </div>

            {deleteMode && (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 text-center">
                <p className="font-bold text-red-700">Modo eliminación activo</p>
                <p className="text-sm text-red-600">Tocá cualquier producto de abajo para eliminarlo. Se borrará de forma permanente de la base de datos.</p>
              </div>
            )}

            {loading ? <p className="text-center py-10">Cargando...</p> : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map(p => (
                  <div key={p.id} onClick={() => deleteMode && handleDelete(p.id)} className={`bg-white rounded-3xl overflow-hidden border-2 cursor-pointer transition ${deleteMode ? "border-red-300 hover:border-red-500 hover:shadow-lg shadow-red-100" : "border-pink-100"}`}>
                    <div className="relative">
                      <img src={p.imageUrl} alt={p.name} className="w-full h-48 object-cover" />
                      {deleteMode && <div className="absolute inset-0 bg-red-500/80 grid place-items-center"><span className="bg-white text-red-600 px-4 py-2 rounded-full font-bold text-sm">🗑️ Tocar para eliminar</span></div>}
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="flex justify-between items-start gap-2"><h3 className="font-bold text-sm leading-tight">{p.name}</h3><span className="text-xs bg-pink-50 border border-pink-100 px-2 py-1 rounded-full capitalize">{p.category}</span></div>
                      <p className="text-xs text-gray-500 line-clamp-2">{p.description}</p>
                      <div className="flex justify-between items-center"><span className="font-bold text-[#e91e63]">{formatPrice(p.price)}</span><span className={`text-xs px-2 py-1 rounded-full ${p.stock === 0 ? "bg-red-100 text-red-700" : p.stock < 5 ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>Stock: {p.stock}</span></div>
                      <div className="flex gap-2 pt-2">
                        <button onClick={(e) => { e.stopPropagation(); handleEdit(p); }} className="flex-1 py-2.5 rounded-full bg-gray-900 text-white text-xs font-semibold hover:bg-black">✏️ Editar</button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }} className="flex-1 py-2.5 rounded-full bg-red-500 text-white text-xs font-bold hover:bg-red-600">🗑️ Eliminar</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {showProductForm && (
              <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 overflow-auto">
                <form onSubmit={handleSaveProduct} className="bg-white rounded-3xl p-6 w-full max-w-lg max-h-[90vh] overflow-auto space-y-4">
                  <h3 className="text-lg font-bold">{editing ? "Editar producto" : "Nuevo producto"}</h3>
                  <p className="text-xs text-gray-500 bg-pink-50 p-3 rounded-xl">📌 Las imágenes ahora se cargan desde tu galería / biblioteca. El stock, precio y cambios se guardan de forma permanente en la base de datos al hacer clic en Guardar.</p>
                  <input placeholder="Nombre" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required className="w-full px-4 py-3 rounded-2xl border border-pink-200 outline-none" />
                  <textarea placeholder="Descripción" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-4 py-3 rounded-2xl border border-pink-200 outline-none" />
                  <div className="grid grid-cols-2 gap-3"><input placeholder="Precio (ej: 18990)" type="number" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required className="w-full px-4 py-3 rounded-2xl border border-pink-200 outline-none" /><input placeholder="Stock" type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} className="w-full px-4 py-3 rounded-2xl border border-pink-200 outline-none" /></div>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-4 py-3 rounded-2xl border border-pink-200 outline-none"><option value="botellas">Botellas</option><option value="bolsos">Bolsos</option><option value="gorras">Gorras</option><option value="mochilas">Mochilas</option></select>

                  <ImagePicker value={form.imageUrl} onChange={url => setForm({ ...form, imageUrl: url })} label="Imagen del producto" libraryImages={library} />

                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} /> Destacado</label>
                  <div className="flex gap-2"><button type="submit" disabled={saving} className="flex-1 py-3 rounded-full bg-[#e91e63] text-white font-bold disabled:opacity-50">{saving ? "Guardando en BD..." : "💾 Guardar (permanente)"}</button><button type="button" onClick={() => setShowProductForm(false)} className="px-6 py-3 rounded-full border">Cancelar</button></div>
                </form>
              </div>
            )}
          </div>
        )}

        {tab === "biblioteca" && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-pink-100">
              <h2 className="text-xl font-bold">Biblioteca de imágenes</h2>
              <p className="text-sm text-gray-500 mt-1">Subí imágenes desde tu celular o computadora (galería). Quedan guardadas en la base de datos y podés reutilizarlas en productos, hero y logo.</p>
              <label className="mt-4 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#e91e63] text-white font-bold cursor-pointer hover:bg-[#c2185b]">
                <span>📁 Subir imagen de mi galería</span>
                <input type="file" accept="image/*" onChange={handleLibraryUpload} className="hidden" />
              </label>
              <p className="text-xs text-gray-400 mt-2">Formatos: JPG, PNG, WEBP. Se guardan como base64 en PostgreSQL (persistente). Para producción podés configurar Cloudinary en README.</p>
            </div>

            {library.length === 0 ? <div className="bg-white rounded-3xl p-12 text-center border border-pink-100"><p className="text-gray-500">Aún no hay imágenes en biblioteca. Subí una o creá productos.</p></div> : (
              <div className="bg-white rounded-3xl p-6 border border-pink-100">
                <h3 className="font-bold mb-3">Imágenes guardadas ({library.length})</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {library.map((img, i) => (
                    <div key={i} className="border border-pink-100 rounded-2xl overflow-hidden bg-pink-50">
                      <img src={img} alt={`bib-${i}`} className="w-full h-32 object-cover bg-white" />
                      <div className="p-2 flex gap-1">
                        <button onClick={() => { navigator.clipboard.writeText(img); setMessage("🔗 URL copiada"); setTimeout(()=>setMessage(""),1500); }} className="flex-1 text-[11px] bg-white border border-pink-200 rounded-full py-1">Copiar</button>
                        <a href={img} target="_blank" className="text-[11px] bg-gray-900 text-white px-3 py-1 rounded-full">Ver</a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-sm">
              <p className="font-bold">💡 ¿Cómo funciona?</p>
              <p className="mt-1 text-gray-700">Cuando elegís una imagen de tu galería, se sube a <code className="bg-white px-1 rounded">/api/upload</code> y se convierte a data URL o Cloudinary si está configurado. Luego esa URL se guarda en la tabla <code>products.image_url</code>. Al editar/eliminar productos, los cambios se escriben directamente en PostgreSQL — por eso son permanentes.</p>
            </div>
          </div>
        )}

        {tab === "pedidos" && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-pink-100"><h2 className="text-xl font-bold">Pedidos</h2><p className="text-sm text-gray-500">Todos los pedidos se guardan automáticamente al confirmar desde el carrito.</p></div>
            {orders.length === 0 ? <div className="bg-white rounded-3xl p-12 text-center border border-pink-100"><p className="text-gray-500">Aún no hay pedidos.</p></div> :
              orders.map(o => (
                <div key={o.id} className="bg-white rounded-3xl p-6 border border-pink-100">
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div><p className="font-bold">Pedido #{o.id} - {o.customerName}</p><p className="text-sm text-gray-500">📞 {o.customerPhone} • 📍 {o.customerAddress || "Sin dirección"} • {new Date(o.createdAt).toLocaleString("es-AR")}</p>
                      <div className="mt-3 space-y-1">{o.items.map((it: any, idx: number) => (<p key={idx} className="text-sm">• {it.name} x{it.quantity} - {formatPrice(it.price * it.quantity)}</p>))}</div><p className="font-bold text-[#e91e63] mt-2">Total: {formatPrice(o.total)}</p></div>
                    <div className="flex flex-col gap-2"><span className={`px-4 py-2 rounded-full text-xs font-bold text-center capitalize ${o.status === "pendiente" ? "bg-amber-100 text-amber-700" : o.status === "confirmado" ? "bg-blue-100 text-blue-700" : o.status === "enviado" ? "bg-purple-100 text-purple-700" : "bg-green-100 text-green-700"}`}>{o.status}</span>
                      <select value={o.status} onChange={e => updateOrderStatus(o.id, e.target.value)} className="px-4 py-2 rounded-full border border-pink-200 text-sm"><option value="pendiente">Pendiente</option><option value="confirmado">Confirmado</option><option value="enviado">Enviado</option><option value="entregado">Entregado</option><option value="cancelado">Cancelado</option></select><a href={`https://wa.me/${o.customerPhone.replace(/[^0-9]/g, "")}?text=Hola%20${o.customerName}%20tu%20pedido%20%23${o.id}%20`} target="_blank" className="px-4 py-2 rounded-full bg-green-500 text-white text-xs font-bold text-center">WhatsApp</a></div>
                  </div>
                </div>
              ))}
          </div>
        )}

        {tab === "config" && settings && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-pink-100"><h2 className="text-xl font-bold">Configuración general</h2><p className="text-sm text-gray-500">Cambiá logo, colores, hero y datos — todo se guarda en la tabla settings.</p></div>
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl p-6 border border-pink-100 space-y-4"><h3 className="font-bold">Tienda y colores</h3>
                <input value={settings.storeName || ""} onChange={e => setSettings({ ...settings, storeName: e.target.value })} placeholder="Nombre tienda" className="w-full px-4 py-3 rounded-2xl border border-pink-200 outline-none" />
                <div className="grid grid-cols-2 gap-3"><div><label className="text-xs font-semibold">Color principal</label><div className="flex gap-2 items-center"><input type="color" value={settings.primaryColor || "#e91e63"} onChange={e => setSettings({ ...settings, primaryColor: e.target.value })} className="w-12 h-10 rounded-xl" /><input value={settings.primaryColor} onChange={e => setSettings({ ...settings, primaryColor: e.target.value })} className="flex-1 px-3 py-2 rounded-xl border border-pink-200 text-sm" /></div></div><div><label className="text-xs font-semibold">Color secundario</label><div className="flex gap-2 items-center"><input type="color" value={settings.secondaryColor || "#fce7f3"} onChange={e => setSettings({ ...settings, secondaryColor: e.target.value })} className="w-12 h-10 rounded-xl" /><input value={settings.secondaryColor} onChange={e => setSettings({ ...settings, secondaryColor: e.target.value })} className="flex-1 px-3 py-2 rounded-xl border border-pink-200 text-sm" /></div></div></div>
                <input value={settings.heroTitle || ""} onChange={e => setSettings({ ...settings, heroTitle: e.target.value })} placeholder="Título hero" className="w-full px-4 py-3 rounded-2xl border border-pink-200 outline-none" />
                <textarea value={settings.heroSubtitle || ""} onChange={e => setSettings({ ...settings, heroSubtitle: e.target.value })} placeholder="Subtítulo hero" rows={3} className="w-full px-4 py-3 rounded-2xl border border-pink-200 outline-none" />
                <ImagePicker value={settings.heroImageUrl || ""} onChange={url => setSettings({ ...settings, heroImageUrl: url })} label="Imagen principal (hero)" libraryImages={library} />
                <ImagePicker value={settings.logoUrl || ""} onChange={url => setSettings({ ...settings, logoUrl: url })} label="Logo de la tienda" libraryImages={library} />
              </div>
              <div className="bg-white rounded-3xl p-6 border border-pink-100 space-y-4"><h3 className="font-bold">Contacto y WhatsApp</h3><p className="text-xs text-gray-500">Este número se usa en todos los botones “Pedir por WhatsApp”</p><input value={settings.whatsappNumber || ""} onChange={e => setSettings({ ...settings, whatsappNumber: e.target.value })} placeholder="Número WhatsApp (ej: 5491123456789)" className="w-full px-4 py-3 rounded-2xl border-2 border-green-200 outline-none focus:border-green-500" /><input value={settings.contactEmail || ""} onChange={e => setSettings({ ...settings, contactEmail: e.target.value })} placeholder="Email contacto" className="w-full px-4 py-3 rounded-2xl border border-pink-200 outline-none" /><input value={settings.contactPhone || ""} onChange={e => setSettings({ ...settings, contactPhone: e.target.value })} placeholder="Teléfono" className="w-full px-4 py-3 rounded-2xl border border-pink-200 outline-none" /><input value={settings.address || ""} onChange={e => setSettings({ ...settings, address: e.target.value })} placeholder="Dirección" className="w-full px-4 py-3 rounded-2xl border border-pink-200 outline-none" /><input value={settings.instagram || ""} onChange={e => setSettings({ ...settings, instagram: e.target.value })} placeholder="Instagram URL" className="w-full px-4 py-3 rounded-2xl border border-pink-200 outline-none" /><input value={settings.facebook || ""} onChange={e => setSettings({ ...settings, facebook: e.target.value })} placeholder="Facebook URL" className="w-full px-4 py-3 rounded-2xl border border-pink-200 outline-none" /><textarea value={settings.aboutText || ""} onChange={e => setSettings({ ...settings, aboutText: e.target.value })} placeholder="Texto Nosotros" rows={2} className="w-full px-4 py-3 rounded-2xl border border-pink-200 outline-none" /></div>
            </div>
            <button onClick={handleSaveSettings} disabled={saving} className="w-full py-4 rounded-full bg-[#e91e63] text-white font-bold text-lg hover:bg-[#c2185b] disabled:opacity-50">{saving ? "Guardando..." : "💾 Guardar configuración"}</button>
          </div>
        )}

        {tab === "stats" && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-4 gap-4"><div className="bg-white rounded-3xl p-6 border border-pink-100"><p className="text-sm text-gray-500">Productos</p><p className="text-3xl font-bold">{products.length}</p></div><div className="bg-white rounded-3xl p-6 border border-pink-100"><p className="text-sm text-gray-500">Pedidos totales</p><p className="text-3xl font-bold">{orders.length}</p></div><div className="bg-white rounded-3xl p-6 border border-pink-100"><p className="text-sm text-gray-500">Ingresos (estimados)</p><p className="text-3xl font-bold text-[#e91e63]">{formatPrice(orders.reduce((a, b) => a + b.total, 0))}</p></div><div className="bg-white rounded-3xl p-6 border border-pink-100"><p className="text-sm text-gray-500">Stock bajo (&lt;5)</p><p className="text-3xl font-bold text-amber-600">{products.filter(p => p.stock < 5).length}</p></div></div>
            <div className="bg-white rounded-3xl p-6 border border-pink-100"><h3 className="font-bold mb-4">Ventas por categoría</h3><div className="space-y-3">{["botellas", "bolsos", "gorras", "mochilas"].map(cat => { const count = products.filter(p => p.category === cat).length; const pct = products.length ? (count / products.length) * 100 : 0; return (<div key={cat} className="flex items-center gap-3"><span className="w-24 capitalize text-sm font-medium">{cat}</span><div className="flex-1 h-3 bg-pink-50 rounded-full overflow-hidden"><div className="h-full bg-[#e91e63] rounded-full" style={{ width: `${pct}%` }} /></div><span className="text-sm font-bold">{count}</span></div>); })}</div></div>
            <div className="bg-white rounded-3xl p-6 border border-pink-100"><h3 className="font-bold mb-2">Pedidos por estado</h3><div className="flex gap-2 flex-wrap">{["pendiente", "confirmado", "enviado", "entregado", "cancelado"].map(s => (<span key={s} className="px-4 py-2 rounded-full bg-pink-50 border border-pink-100 text-sm capitalize">{s}: {orders.filter(o => o.status === s).length}</span>))}</div></div>
          </div>
        )}
      </div>
    </div>
  );
}
