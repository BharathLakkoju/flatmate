import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { members, flats } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createSupabaseServer } from "@/lib/supabase/server";
import { desc } from "drizzle-orm";

/**
 * Returns the current user's most recent flat membership.
 * Used to restore the session on a new device without going through onboarding again.
 */
export async function GET() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ member: null, flat: null });
  }

  // Find the most recent membership for this user
  const rows = await db
    .select({ member: members, flat: flats })
    .from(members)
    .innerJoin(flats, eq(members.flat_id, flats.id))
    .where(eq(members.user_id, user.id))
    .orderBy(desc(members.created_at))
    .limit(1);

  if (rows.length === 0) {
    return NextResponse.json({ member: null, flat: null });
  }

  return NextResponse.json({ member: rows[0].member, flat: rows[0].flat });
}
