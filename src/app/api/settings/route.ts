import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { isAdminAuthenticated } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function GET() {
  const all = await db.select().from(settings).limit(1);
  return NextResponse.json(all[0] || null);
}

export async function PUT(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const body = await req.json();
  const existing = await db.select().from(settings).limit(1);
  if (existing.length === 0) {
    const [created] = await db.insert(settings).values(body).returning();
    return NextResponse.json(created);
  }
  const [updated] = await db.update(settings).set({ ...body, updatedAt: new Date() }).where(eq(settings.id, existing[0].id)).returning();
  return NextResponse.json(updated);
}

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const body = await req.json();
  const existing = await db.select().from(settings).limit(1);
  if (existing.length > 0) {
    const [updated] = await db.update(settings).set({ ...body, updatedAt: new Date() }).where(eq(settings.id, existing[0].id)).returning();
    return NextResponse.json(updated);
  }
  const [created] = await db.insert(settings).values(body).returning();
  return NextResponse.json(created);
}
