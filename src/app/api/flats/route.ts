import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { flats, members } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { flatSchema } from "@/lib/validators/flat";
import { createSupabaseServer } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const [flat] = await db
    .select()
    .from(flats)
    .where(eq(flats.id, id))
    .limit(1);

  if (!flat) {
    return NextResponse.json({ error: "Flat not found" }, { status: 404 });
  }

  return NextResponse.json(flat);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = flatSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  // Get authenticated user
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  const prefix = parsed.data.name.replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase() || "FLT";
  const inviteCode = `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;

  const [flat] = await db
    .insert(flats)
    .values({ name: parsed.data.name, invite_code: inviteCode })
    .returning();

  // Auto-add the creator as admin member
  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Admin";
  await db.insert(members).values({
    flat_id: flat.id,
    display_name: displayName,
    user_id: user?.id || null,
    role: "admin",
  });

  return NextResponse.json(flat, { status: 201 });
}
