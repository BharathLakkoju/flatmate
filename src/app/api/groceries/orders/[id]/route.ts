import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { groceryOrders, groceryItems, expenseEntries } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireFlatMember } from "@/lib/api/auth-guard";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const [order] = await db
    .select()
    .from(groceryOrders)
    .where(eq(groceryOrders.id, id))
    .limit(1);

  if (!order) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const auth = await requireFlatMember(order.flat_id);
  if (!auth.ok) return auth.response;

  // Delete in cascade-safe order: nullify items' order_id, delete order, delete linked expense
  await db.transaction(async (tx) => {
    // Unlink items from order (so they remain in the grocery list)
    await tx
      .update(groceryItems)
      .set({ order_id: null })
      .where(eq(groceryItems.order_id, id));

    // Delete the order
    await tx.delete(groceryOrders).where(eq(groceryOrders.id, id));

    // Delete linked expense entry if present
    if (order.expense_entry_id) {
      await tx
        .delete(expenseEntries)
        .where(eq(expenseEntries.id, order.expense_entry_id));
    }
  });

  return NextResponse.json({ success: true });
}
