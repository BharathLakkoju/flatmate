import { updateSession } from "@/lib/supabase/middleware";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths for /app/* (authenticated shell).
     * Skip static files, images, and Next.js internals.
     */
    "/app/:path*",
  ],
};
