import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { groceryItems, groceryUsageLogs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { logGroceryUsageSchema } from "@/lib/validators/grocery";
import { requireFlatMember } from "@/lib/api/auth-guard";

function computeStatus(
  remaining: number,
  total: number
): "in_stock" | "low" {
  if (total === 0 || remaining <= 0) return "low";
  const ratio = remaining / total;
  if (ratio <= 0.25) return "low";
  return "in_stock";
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { flat_id, ...rest } = body;

  if (!flat_id) {
    return NextResponse.json({ error: "flat_id required" }, { status: 400 });
  }

  const auth = await requireFlatMember(flat_id);
  if (!auth.ok) return auth.response;

  const parsed = logGroceryUsageSchema.safeParse(rest);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  // Fetch item to get current state
  const [item] = await db
    .select()
    .from(groceryItems)
    .where(eq(groceryItems.id, parsed.data.item_id))
    .limit(1);

  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  if (item.flat_id !== flat_id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const currentRemaining = Number(item.remaining_quantity);
  const total = Number(item.total_quantity);
  const newRemaining = Math.max(0, currentRemaining - parsed.data.amount_used);

  // If fully consumed, log usage then delete the item
  if (newRemaining <= 0) {
    await db.transaction(async (tx) => {
      await tx.insert(groceryUsageLogs).values({
        item_id: parsed.data.item_id,
        flat_id,
        logged_by: auth.memberId,
        log_date: parsed.data.log_date,
        amount_used: String(parsed.data.amount_used),
        note: parsed.data.note ?? null,
      });
      await tx.delete(groceryUsageLogs).where(eq(groceryUsageLogs.item_id, parsed.data.item_id));
      await tx.delete(groceryItems).where(eq(groceryItems.id, parsed.data.item_id));
    });
    return NextResponse.json({ deleted: true, id: parsed.data.item_id }, { status: 200 });
  }

  const newStatus = computeStatus(newRemaining, total);

  // Insert usage log + update item in transaction
  const result = await db.transaction(async (tx) => {
    const [log] = await tx
      .insert(groceryUsageLogs)
      .values({
        item_id: parsed.data.item_id,
        flat_id,
        logged_by: auth.memberId,
        log_date: parsed.data.log_date,
        amount_used: String(parsed.data.amount_used),
        note: parsed.data.note ?? null,
      })
      .returning();

    const [updatedItem] = await tx
      .update(groceryItems)
      .set({
        remaining_quantity: String(newRemaining),
        status: newStatus,
        updated_at: new Date(),
      })
      .where(eq(groceryItems.id, parsed.data.item_id))
      .returning();

    return { log, item: updatedItem };
  });

  return NextResponse.json(result, { status: 201 });
}
