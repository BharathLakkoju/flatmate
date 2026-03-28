import { updateSession } from "@/lib/supabase/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Edge proxy — runs on Vercel's Edge Network before every request.
 *
 * Maintenance mode:
 *   Set MAINTENANCE_MODE=true in your Vercel project environment variables.
 *   All traffic is rewritten to /maintenance while static assets and the
 *   maintenance page itself continue to load normally.
 *   Remove the variable (or set it to "false") and redeploy to restore the app.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Maintenance gate ──────────────────────────────────────────────────────
  if (process.env.MAINTENANCE_MODE === "true") {
    const isAllowed =
      pathname.startsWith("/maintenance") ||
      pathname.startsWith("/_next") ||
      pathname.startsWith("/favicon") ||
      pathname.startsWith("/icons") ||
      pathname === "/manifest.webmanifest" ||
      /\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf)$/.test(pathname);

    if (!isAllowed) {
      return NextResponse.rewrite(new URL("/maintenance", request.url));
    }

    return NextResponse.next();
  }

  // ── Normal mode: refresh Supabase session for authenticated shell ─────────
  if (pathname.startsWith("/app")) {
    return await updateSession(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except Next.js internals and static assets so the
     * maintenance gate runs on every page and API route.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
