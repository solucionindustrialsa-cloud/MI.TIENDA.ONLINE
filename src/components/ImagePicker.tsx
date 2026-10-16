"use client";
import { useState, useRef } from "react";

export default function ImagePicker({ value, onChange, label, libraryImages }: { value: string; onChange: (url: string) => void; label: string; libraryImages?: string[] }) {
  const [uploading, setUploading] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      alert("La imagen es muy grande (máx 4MB). Probá con una más pequeña o comprimila.");
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) onChange(data.url);
      else alert(data.error || "Error al subir");
    } catch (err: any) {
      alert("Error al subir imagen");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-semibold flex items-center gap-2">{label} <span className="text-xs font-normal text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full">desde tu biblioteca</span></label>

      <div
        onClick={() => fileRef.current?.click()}
        className="border-2 border-dashed border-pink-200 rounded-2xl p-6 text-center bg-pink-50/40 hover:bg-pink-50 cursor-pointer transition group"
      >
        <p className="text-3xl">📁</p>
        <p className="font-semibold text-sm mt-2 group-hover:text-[#e91e63]">{uploading ? "Subiendo..." : "Elegir imagen de mi galería"}</p>
        <p className="text-xs text-gray-500 mt-1">Tocá para abrir tu biblioteca / archivos • JPG, PNG, WEBP hasta 4MB</p>
        <p className="text-[11px] text-gray-400 mt-2">La imagen se guarda automáticamente en la base de datos y queda disponible en la tienda</p>
      </div>
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />

      {value && (
        <div className="relative">
          <img src={value} alt="preview" className="w-full h-48 object-cover rounded-2xl border border-pink-200" />
          <button type="button" onClick={() => onChange("")} className="absolute top-2 right-2 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold border border-pink-200 shadow">✕ Quitar</button>
          <p className="text-[11px] text-green-600 mt-1 font-medium">✓ Imagen lista para guardar</p>
        </div>
      )}

      {libraryImages && libraryImages.length > 0 && (
        <div>
          <button type="button" onClick={() => setShowLibrary(!showLibrary)} className="text-xs font-semibold text-[#e91e63] underline">{showLibrary ? "Ocultar biblioteca" : `Ver biblioteca (${libraryImages.length} imágenes previas)`}</button>
          {showLibrary && (
            <div className="grid grid-cols-4 gap-2 mt-2 p-2 bg-white border border-pink-100 rounded-2xl">
              {libraryImages.map((img, i) => (
                <button key={i} type="button" onClick={() => onChange(img)} className={`rounded-xl overflow-hidden border-2 ${value === img ? "border-[#e91e63]" : "border-transparent"}`}>
                  <img src={img} alt={`lib-${i}`} className="w-full h-16 object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <details className="text-xs">
        <summary className="cursor-pointer text-gray-500 underline">O avanzado: pegar URL externa</summary>
        <input value={value?.startsWith("data:") ? "" : value || ""} onChange={e => onChange(e.target.value)} placeholder="https://..." className="w-full mt-2 px-3 py-2 rounded-xl border border-gray-200 outline-none text-xs" />
        <p className="text-[11px] text-gray-400 mt-1">Si pegás una URL externa, se usará directamente sin subir archivo</p>
      </details>
    </div>
  );
}
