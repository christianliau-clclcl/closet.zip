import type { Metadata } from "next";
import { redirect } from "next/navigation";
import WelcomeFlow from "@/components/WelcomeFlow";
import { closetNameFrom } from "@/lib/closet-name";
import { getMyUnit } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Welcome" };

// Onboarding (PRODUCT.md 15½), shown once at first login: the closet sends
// you here until you've finished or skipped it. Logged-in only.
export default async function WelcomePage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/login");

  return (
    <main className="flex flex-1 flex-col">
      <WelcomeFlow closetName={closetNameFrom(data.claims)} initialUnit={await getMyUnit()} />
    </main>
  );
}
