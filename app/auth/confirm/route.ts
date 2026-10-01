import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Where the links in Supabase's emails land. Supabase has already checked the
// link and sends a one-time ?code=, which we swap for a login session here.
// The swap only works in the browser that asked for the email, because part
// of the check is stored there; Supabase's default emails can't avoid that.
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) redirect(next);
  }

  // Expired or already-used link.
  if (searchParams.get("error_code") === "otp_expired") {
    redirect("/login?notice=link-expired");
  }

  // Most likely the link was opened in a different browser. For a new
  // account the email is confirmed by now, so the person can just log in.
  redirect("/login?notice=confirmed");
}

// Only allow redirects to pages on this site, e.g. "/reset-password",
// so a crafted link can't send someone to another website.
function safeNext(next: string | null): string {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}
