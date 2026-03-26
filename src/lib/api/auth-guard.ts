import { createSupabaseServer } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { members } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

/**
 * Verify the request is authenticated and the caller belongs to flat_id.
 * Returns { user, member } on success, or a NextResponse error to return early.
 */
export async function requireFlatMember(flat_id: string): Promise<
  | { ok: true; userId: string; memberId: string }
  | { ok: false; response: NextResponse }
> {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const [member] = await db
    .select()
    .from(members)
    .where(and(eq(members.flat_id, flat_id), eq(members.user_id, user.id)))
    .limit(1);

  if (!member) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Forbidden: you are not a member of this flat" },
        { status: 403 }
      ),
    };
  }

  return { ok: true, userId: user.id, memberId: member.id };
}
