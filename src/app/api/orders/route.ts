import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { desc } from "drizzle-orm";
import { isAdminAuthenticated } from "@/lib/auth";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const all = await db.select().from(orders).orderBy(desc(orders.createdAt));
  return NextResponse.json(all);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerName, customerPhone, customerAddress, customerNotes, items, total, status } = body;
    if (!customerName || !customerPhone || !items || !total) {
      return NextResponse.json({ error: "Faltan datos del pedido" }, { status: 400 });
    }
    const [created] = await db.insert(orders).values({
      customerName,
      customerPhone,
      customerAddress: customerAddress || "",
      customerNotes: customerNotes || "",
      items,
      total: Number(total),
      status: status || "pendiente",
    }).returning();
    return NextResponse.json(created);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
