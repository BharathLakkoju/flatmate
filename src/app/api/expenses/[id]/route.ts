import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { expenseEntries } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  const [row] = await db
    .update(expenseEntries)
    .set({ ...body, updated_at: new Date() })
    .where(eq(expenseEntries.id, id))
    .returning();

  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(row);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const [row] = await db
    .delete(expenseEntries)
    .where(eq(expenseEntries.id, id))
    .returning();

  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ deleted: true });
}
