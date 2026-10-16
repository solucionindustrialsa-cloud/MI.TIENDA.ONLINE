import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const required = process.env.ADMIN_PASSWORD || "JESSI3";

  if (!required) {
    const res = NextResponse.json({ success: true, message: "Acceso sin contraseña" });
    res.cookies.set("admin_auth", "authenticated", { httpOnly: true, path: "/", maxAge: 60*60*24*7 });
    return res;
  }

  if (body.password === required) {
    const res = NextResponse.json({ success: true });
    res.cookies.set("admin_auth", "authenticated", { httpOnly: true, path: "/", maxAge: 60*60*24*7, secure: process.env.NODE_ENV==="production" });
    return res;
  }
  return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
}
