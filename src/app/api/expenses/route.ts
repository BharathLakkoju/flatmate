import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { expenseEntries } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { expenseSchema } from "@/lib/validators/expense";
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
    .from(expenseEntries)
    .where(eq(expenseEntries.flat_id, flatId))
    .orderBy(expenseEntries.date);

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

  const parsed = expenseSchema.safeParse(rest);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const [row] = await db.insert(expenseEntries).values({
    ...parsed.data,
    amount_inr: String(parsed.data.amount_inr),
    flat_id,
  }).returning();
  return NextResponse.json(row, { status: 201 });
}
