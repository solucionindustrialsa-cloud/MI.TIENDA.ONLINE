import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const url = formData.get("url") as string | null;

    // Permitir URL directa solo si es https:// (no data: base64)
    if (url && !file) {
      if (url.startsWith("data:")) {
        return NextResponse.json(
          { error: "No se almacenan imágenes Base64 directamente en la BD. Usa subida de archivo." },
          { status: 400 }
        );
      }
      return NextResponse.json({ url });
    }

    if (file) {
      const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
      const preset = process.env.CLOUDINARY_UPLOAD_PRESET;

      if (cloudName && preset) {
        const cloudForm = new FormData();
        cloudForm.append("file", file);
        cloudForm.append("upload_preset", preset);
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: "POST",
          body: cloudForm,
        });
        const data = await res.json();
        if (data.secure_url) return NextResponse.json({ url: data.secure_url });
        // Si Cloudinary falla, continuar con almacenamiento local
      }

      // Almacenamiento permanente alternativo: archivo en public/uploads (persistente si se usa volumen o Cloudinary en prod)
      // No usar Base64 en BD: generaría strings de ~7MB que exceden límites de VARCHAR, body-parser y causan "Failed query: insert"
      const buffer = Buffer.from(await file.arrayBuffer());

      // Limitar tamaño a 4MB para evitar payloads enormes
      if (buffer.length > 4 * 1024 * 1024) {
        return NextResponse.json(
          { error: "Imagen demasiado grande (máx 4MB). Comprime la imagen o usa Cloudinary." },
          { status: 413 }
        );
      }

      const ext = file.name?.split(".").pop() || file.type.split("/")[1] || "jpg";
      const filename = `${Date.now()}-${randomUUID()}.${ext}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });
      const filepath = path.join(uploadDir, filename);
      await writeFile(filepath, buffer);

      const publicUrl = `/uploads/${filename}`;
      return NextResponse.json({ url: publicUrl });
    }

    return NextResponse.json({ error: "No se recibió archivo ni URL" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
