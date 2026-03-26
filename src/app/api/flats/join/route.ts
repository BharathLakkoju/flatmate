import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { flats, members } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { joinFlatSchema } from "@/lib/validators/flat";
import { createSupabaseServer } from "@/lib/supabase/server";
import { notifyFlat } from "@/lib/api/notify";

export async function POST(req: NextRequest) {
  // Derive user from session — never trust caller-supplied user_id
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  const body = await req.json();
  const { display_name } = body;

  const parsed = joinFlatSchema.safeParse({ invite_code: body.invite_code });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  if (!display_name || typeof display_name !== "string" || display_name.trim().length === 0) {
    return NextResponse.json(
      { error: "display_name required" },
      { status: 400 }
    );
  }

  const [flat] = await db
    .select()
    .from(flats)
    .where(eq(flats.invite_code, parsed.data.invite_code))
    .limit(1);

  if (!flat) {
    return NextResponse.json({ error: "Invalid invite code" }, { status: 404 });
  }

  const [member] = await db
    .insert(members)
    .values({
      flat_id: flat.id,
      display_name: display_name.trim().slice(0, 100),
      user_id: user?.id ?? null,  // always derived from session
      role: "member",
    })
    .returning();

  // Notify other flatmates that someone joined
  await notifyFlat({
    flat_id: flat.id,
    actor_id: member.id,
    type: "member_joined",
    title: `${member.display_name} joined the flat`,
    body: `Say hello to your new flatmate!`,
  });

  return NextResponse.json({ flat, member }, { status: 201 });
}