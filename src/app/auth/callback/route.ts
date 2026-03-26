import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/** Only allow redirecting to these internal paths after OAuth */
const ALLOWED_NEXT_PREFIXES = ["/app/", "/onboarding", "/join"];

function sanitizeNext(next: string | null): string {
  if (!next) return "/onboarding";
  // Reject absolute URLs and anything not starting with an allowed prefix
  if (next.startsWith("http") || next.startsWith("//")) return "/onboarding";
  const isAllowed = ALLOWED_NEXT_PREFIXES.some((prefix) => next.startsWith(prefix));
  return isAllowed ? next : "/onboarding";
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = sanitizeNext(searchParams.get("next"));

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Auth code exchange failed — redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
