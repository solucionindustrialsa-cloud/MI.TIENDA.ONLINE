import { cookies } from "next/headers";

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const adminAuth = cookieStore.get("admin_auth")?.value;
  const requiredPassword = process.env.ADMIN_PASSWORD || "JESSI3";
  if (!requiredPassword) {
    return true;
  }
  return adminAuth === "authenticated";
}

export async function setAdminAuth() {
  const cookieStore = await cookies();
  cookieStore.set("admin_auth", "authenticated", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

export async function clearAdminAuth() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_auth");
}
