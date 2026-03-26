import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";

interface NotifyParams {
  flat_id: string;
  actor_id: string;
  type: "expense" | "meal" | "task" | "member_joined";
  title: string;
  body?: string;
}

/** Insert a flat-wide notification. Errors are caught so they never fail the caller. */
export async function notifyFlat(params: NotifyParams): Promise<void> {
  try {
    await db.insert(notifications).values({
      flat_id: params.flat_id,
      actor_id: params.actor_id,
      type: params.type,
      title: params.title,
      body: params.body ?? null,
    });
  } catch (err) {
    console.error("[notify] failed to create notification:", err);
  }
}
