import type { Metadata } from "next";
import { redirect } from "next/navigation";
import WelcomeFlow from "@/components/WelcomeFlow";
import { closetNameFrom } from "@/lib/closet-name";
import { ONBOARDING_STEPS } from "@/lib/onboarding";
import { getMyClosetSetup, getMyOnboardingStep, getMyUnit } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Welcome" };

// Onboarding (PRODUCT.md 15½, 15¼b): the closet sends you here until you've
// seen every step, starting where you left off. From MENU → Closet setup
// (?from=menu) it starts at the beginning, with your earlier answers.
// Logged-in only.
export default async function WelcomePage(props: PageProps<"/welcome">) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/login");

  const fromMenu = (await props.searchParams).from === "menu";
  const [unit, setup, reached] = await Promise.all([getMyUnit(), getMyClosetSetup(), getMyOnboardingStep()]);
  const startAt = fromMenu ? 0 : Math.min(reached, ONBOARDING_STEPS - 1);

  return (
    <main className="flex flex-1 flex-col">
      <WelcomeFlow
        closetName={closetNameFrom(data.claims)}
        initialUnit={unit}
        setup={setup}
        startAt={startAt}
        reached={reached}
      />
    </main>
  );
}
