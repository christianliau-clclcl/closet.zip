import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

// Next.js runs this before every matching request (it was called "middleware"
// before Next.js 16). It only keeps the login session fresh; pages decide
// for themselves what logged-out visitors see.
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Skip files that never need a login: Next.js internals, the favicon,
  // and images.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
