import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  groceryOrders,
  groceryItems,
  expenseEntries,
} from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { createGroceryOrderSchema } from "@/lib/validators/grocery";
import { requireFlatMember } from "@/lib/api/auth-guard";
import { notifyFlat } from "@/lib/api/notify";

export async function GET(req: NextRequest) {
  const flatId = req.nextUrl.searchParams.get("flat_id");
  if (!flatId) {
    return NextResponse.json({ error: "flat_id required" }, { status: 400 });
  }

  const auth = await requireFlatMember(flatId);
  if (!auth.ok) return auth.response;

  const rows = await db
    .select()
    .from(groceryOrders)
    .where(eq(groceryOrders.flat_id, flatId))
    .orderBy(desc(groceryOrders.order_date));

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { flat_id, ...rest } = body;

  if (!flat_id) {
    return NextResponse.json({ error: "flat_id required" }, { status: 400 });
  }

  const auth = await requireFlatMember(flat_id);
  if (!auth.ok) return auth.response;

  const parsed = createGroceryOrderSchema.safeParse(rest);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  // Use a transaction: create expense entry + grocery order + grocery items
  const result = await db.transaction(async (tx) => {
    // 1. Create expense entry
    const [expense] = await tx
      .insert(expenseEntries)
      .values({
        flat_id,
        date: parsed.data.order_date,
        category: "groceries",
        amount_inr: String(parsed.data.total_amount_inr),
        paid_by: parsed.data.paid_by,
        note: `Grocery order via ${parsed.data.platform}`,
      })
      .returning();

    // 2. Create grocery order
    const [order] = await tx
      .insert(groceryOrders)
      .values({
        flat_id,
        platform: parsed.data.platform,
        platform_label: parsed.data.platform_label ?? null,
        total_amount_inr: String(parsed.data.total_amount_inr),
        order_date: parsed.data.order_date,
        expense_entry_id: expense.id,
        created_by: auth.memberId,
      })
      .returning();

    // 3. Create grocery items
    const itemRows = await tx
      .insert(groceryItems)
      .values(
        parsed.data.items.map((item) => ({
          flat_id,
          order_id: order.id,
          name: item.name,
          unit_type: item.unit_type,
          unit_label: item.unit_label,
          total_quantity: String(item.total_quantity),
          remaining_quantity: String(item.total_quantity), // starts full
          price_inr: item.price_inr != null ? String(item.price_inr) : null,
          purchase_date: parsed.data.order_date,
          estimated_days: item.estimated_days ?? null,
          status: "in_stock" as const,
          created_by: auth.memberId,
        }))
      )
      .returning();

    return { order, items: itemRows, expense };
  });

  await notifyFlat({
    flat_id,
    actor_id: auth.memberId,
    type: "expense",
    title: `${auth.memberName} logged a grocery order`,
    body: `₹${parsed.data.total_amount_inr} · ${parsed.data.items.length} items from ${parsed.data.platform}`,
  });

  return NextResponse.json(result, { status: 201 });
}
