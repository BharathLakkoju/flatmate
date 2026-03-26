import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { members } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { createSupabaseServer } from "@/lib/supabase/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [target] = await db
    .select()
    .from(members)
    .where(eq(members.id, id))
    .limit(1);

  if (!target || target.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const displayName = typeof body.display_name === "string" ? body.display_name.trim() : null;

  if (!displayName) {
    return NextResponse.json({ error: "display_name required" }, { status: 400 });
  }

  const [updated] = await db
    .update(members)
    .set({ display_name: displayName })
    .where(eq(members.id, id))
    .returning();

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Verify the requester is authenticated
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get the member to be removed
  const [target] = await db
    .select()
    .from(members)
    .where(eq(members.id, id))
    .limit(1);

  if (!target) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  // Verify the requester is an admin of the same flat
  const [requester] = await db
    .select()
    .from(members)
    .where(and(eq(members.flat_id, target.flat_id), eq(members.user_id, user.id)))
    .limit(1);

  if (!requester || requester.role !== "admin") {
    return NextResponse.json({ error: "Only admins can remove members" }, { status: 403 });
  }

  // Prevent admin from removing themselves
  if (target.id === requester.id) {
    return NextResponse.json({ error: "Cannot remove yourself" }, { status: 400 });
  }

  await db.delete(members).where(eq(members.id, id));

  return NextResponse.json({ success: true });
}
