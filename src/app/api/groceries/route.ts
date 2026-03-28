import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { groceryItems } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { createGroceryItemSchema } from "@/lib/validators/grocery";
import { requireFlatMember } from "@/lib/api/auth-guard";

export async function GET(req: NextRequest) {
  const flatId = req.nextUrl.searchParams.get("flat_id");
  if (!flatId) {
    return NextResponse.json({ error: "flat_id required" }, { status: 400 });
  }

  const auth = await requireFlatMember(flatId);
  if (!auth.ok) return auth.response;

  const rows = await db
    .select()
    .from(groceryItems)
    .where(eq(groceryItems.flat_id, flatId))
    .orderBy(desc(groceryItems.created_at));

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

  const parsed = createGroceryItemSchema.safeParse(rest);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const [row] = await db
    .insert(groceryItems)
    .values({
      ...parsed.data,
      flat_id,
      created_by: auth.memberId,
      total_quantity: String(parsed.data.total_quantity),
      remaining_quantity: String(parsed.data.remaining_quantity),
      price_inr: parsed.data.price_inr != null ? String(parsed.data.price_inr) : null,
      order_id: parsed.data.order_id ?? null,
    })
    .returning();

  return NextResponse.json(row, { status: 201 });
}
