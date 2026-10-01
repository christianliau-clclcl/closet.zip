import { createBrowserClient } from "@supabase/ssr";

// Supabase from the browser: used by client components such as the login form.
// The login session is stored in cookies so the server can read it too.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
