import Link from "next/link";
import ResetPasswordForm from "@/components/ResetPasswordForm";
import TopBar from "@/components/TopBar";
import { createClient } from "@/lib/supabase/server";

// Where a reset email's link ends up (via /auth/confirm, which logs the person
// in). No session means the link didn't work: expired, already used, or
// opened in a different browser from the one that asked for it.
export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  return (
    <>
      <TopBar />
      <main className="mx-auto w-full max-w-sm px-4 py-12 md:py-20">
        {data?.claims ? (
          <ResetPasswordForm />
        ) : (
          <div>
            <h1 className="font-serif text-title">This link didn&apos;t work</h1>
            <p className="mt-4 text-stone">
              It may have expired or already been used, or it was opened in a different
              browser from the one you asked for it in.
            </p>
            <Link
              href="/forgot-password"
              className="mt-8 block w-full bg-ink px-5 py-3 text-center font-medium text-cell"
            >
              Send a new link
            </Link>
          </div>
        )}
      </main>
    </>
  );
}
