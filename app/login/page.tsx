import { redirect } from "next/navigation";
import AuthForm from "@/components/AuthForm";
import TopBar from "@/components/TopBar";
import { loginNotices, type LoginNotice } from "@/lib/auth-messages";
import { createClient } from "@/lib/supabase/server";

// Log in / sign up. Already logged in? Go straight to the closet.
export default async function LoginPage(props: PageProps<"/login">) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (data?.claims) redirect("/");

  // ?notice=confirmed etc., set by /auth/confirm after an email link.
  const { notice } = await props.searchParams;
  const knownNotice =
    typeof notice === "string" && notice in loginNotices ? (notice as LoginNotice) : undefined;

  return (
    <>
      <TopBar />
      <main className="mx-auto w-full max-w-sm px-4 py-12 md:py-20">
        <AuthForm notice={knownNotice} />
      </main>
    </>
  );
}
