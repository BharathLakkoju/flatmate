import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { groceryItems, groceryOrders, expenseEntries } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { updateGroceryItemSchema } from "@/lib/validators/grocery";
import { requireFlatMember } from "@/lib/api/auth-guard";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  const [existing] = await db
    .select()
    .from(groceryItems)
    .where(eq(groceryItems.id, id))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const auth = await requireFlatMember(existing.flat_id);
  if (!auth.ok) return auth.response;

  const parsed = updateGroceryItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const updateData: Record<string, unknown> = {
    updated_at: new Date(),
  };

  if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
  if (parsed.data.unit_type !== undefined) updateData.unit_type = parsed.data.unit_type;
  if (parsed.data.unit_label !== undefined) updateData.unit_label = parsed.data.unit_label;
  if (parsed.data.total_quantity !== undefined)
    updateData.total_quantity = String(parsed.data.total_quantity);
  if (parsed.data.remaining_quantity !== undefined)
    updateData.remaining_quantity = String(parsed.data.remaining_quantity);
  if (parsed.data.price_inr !== undefined)
    updateData.price_inr = parsed.data.price_inr != null ? String(parsed.data.price_inr) : null;
  if (parsed.data.purchase_date !== undefined) updateData.purchase_date = parsed.data.purchase_date;
  if (parsed.data.estimated_days !== undefined) updateData.estimated_days = parsed.data.estimated_days;
  if (parsed.data.status !== undefined) updateData.status = parsed.data.status;

  const [row] = await db
    .update(groceryItems)
    .set(updateData)
    .where(eq(groceryItems.id, id))
    .returning();

  return NextResponse.json(row);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const [existing] = await db
    .select()
    .from(groceryItems)
    .where(eq(groceryItems.id, id))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const auth = await requireFlatMember(existing.flat_id);
  if (!auth.ok) return auth.response;

  await db.delete(groceryItems).where(eq(groceryItems.id, id));
  return NextResponse.json({ success: true });
}
