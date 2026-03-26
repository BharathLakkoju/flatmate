import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";
import { eq, and, lte } from "drizzle-orm";
import { requireFlatMember } from "@/lib/api/auth-guard";

/** DELETE /api/notifications/clear?flat_id=...&before=ISO — remove all notifications before a timestamp */
export async function DELETE(req: NextRequest) {
  const flatId = req.nextUrl.searchParams.get("flat_id");
  const before = req.nextUrl.searchParams.get("before");

  if (!flatId) {
    return NextResponse.json({ error: "flat_id required" }, { status: 400 });
  }

  const auth = await requireFlatMember(flatId);
  if (!auth.ok) return auth.response;

  if (before) {
    const ts = new Date(before);
    if (isNaN(ts.getTime())) {
      return NextResponse.json({ error: "Invalid before timestamp" }, { status: 400 });
    }
    await db
      .delete(notifications)
      .where(and(eq(notifications.flat_id, flatId), lte(notifications.created_at, ts)));
  } else {
    await db.delete(notifications).where(eq(notifications.flat_id, flatId));
  }

  return NextResponse.json({ cleared: true });
}
