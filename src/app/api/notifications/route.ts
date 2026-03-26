import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
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
    .from(notifications)
    .where(eq(notifications.flat_id, flatId))
    .orderBy(desc(notifications.created_at))
    .limit(50);

  return NextResponse.json(rows);
}
