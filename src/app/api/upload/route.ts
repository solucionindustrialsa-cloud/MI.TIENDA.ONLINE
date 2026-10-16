import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const url = formData.get("url") as string | null;

    if (url && !file) {
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
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const base64 = buffer.toString("base64");
      const mime = file.type || "image/jpeg";
      const dataUrl = `data:${mime};base64,${base64}`;
      return NextResponse.json({ url: dataUrl });
    }

    return NextResponse.json({ error: "No se recibió archivo ni URL" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
