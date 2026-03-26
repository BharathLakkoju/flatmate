import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { mealPlanEntries } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { mealSchema } from "@/lib/validators/meal";
import { requireFlatMember } from "@/lib/api/auth-guard";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const [existing] = await db
    .select()
    .from(mealPlanEntries)
    .where(eq(mealPlanEntries.id, id))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const auth = await requireFlatMember(existing.flat_id);
  if (!auth.ok) return auth.response;

  const body = await req.json();
  const parsed = mealSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const [row] = await db
    .update(mealPlanEntries)
    .set({ ...parsed.data, updated_at: new Date() })
    .where(eq(mealPlanEntries.id, id))
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
    .from(mealPlanEntries)
    .where(eq(mealPlanEntries.id, id))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const auth = await requireFlatMember(existing.flat_id);
  if (!auth.ok) return auth.response;

  await db.delete(mealPlanEntries).where(eq(mealPlanEntries.id, id));
  return NextResponse.json({ deleted: true });
}
