import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { flats, members } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { invite_code, display_name, user_id } = body;

  if (!invite_code || !display_name) {
    return NextResponse.json(
      { error: "invite_code and display_name required" },
      { status: 400 }
    );
  }

  const [flat] = await db
    .select()
    .from(flats)
    .where(eq(flats.invite_code, invite_code))
    .limit(1);

  if (!flat) {
    return NextResponse.json({ error: "Invalid invite code" }, { status: 404 });
  }

  const [member] = await db
    .insert(members)
    .values({
      flat_id: flat.id,
      display_name,
      user_id: user_id || null,
      role: "member",
    })
    .returning();

  return NextResponse.json({ flat, member }, { status: 201 });
}
