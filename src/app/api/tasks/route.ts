import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tasks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { taskSchema } from "@/lib/validators/task";
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
    .from(tasks)
    .where(eq(tasks.flat_id, flatId))
    .orderBy(tasks.due_date);

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

  const parsed = taskSchema.safeParse(rest);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const [row] = await db.insert(tasks).values({ ...parsed.data, flat_id }).returning();

  await notifyFlat({
    flat_id,
    actor_id: auth.memberId,
    type: "task",
    title: `${auth.memberName} added a task`,
    body: `"${parsed.data.title}" · ${parsed.data.priority} priority`,
  });

  return NextResponse.json(row, { status: 201 });
}
