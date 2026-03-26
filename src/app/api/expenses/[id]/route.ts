import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { expenseEntries } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { expenseSchema } from "@/lib/validators/expense";
import { requireFlatMember } from "@/lib/api/auth-guard";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Fetch the existing row first to get flat_id for auth check
  const [existing] = await db
    .select()
    .from(expenseEntries)
    .where(eq(expenseEntries.id, id))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const auth = await requireFlatMember(existing.flat_id);
  if (!auth.ok) return auth.response;

  const body = await req.json();
  const parsed = expenseSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const updates: Record<string, unknown> = { ...parsed.data, updated_at: new Date() };
  if (parsed.data.amount_inr !== undefined) {
    updates.amount_inr = String(parsed.data.amount_inr);
  }

  const [row] = await db
    .update(expenseEntries)
    .set(updates)
    .where(eq(expenseEntries.id, id))
    .returning();

  return NextResponse.json(row);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const [existing] = await db
    .select()
    .from(expenseEntries)
    .where(eq(expenseEntries.id, id))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const auth = await requireFlatMember(existing.flat_id);
  if (!auth.ok) return auth.response;

  await db.delete(expenseEntries).where(eq(expenseEntries.id, id));
  return NextResponse.json({ deleted: true });
}
