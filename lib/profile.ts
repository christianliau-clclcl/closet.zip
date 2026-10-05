import type { Unit } from "@/lib/measurements";
import { createClient } from "@/lib/supabase/server";

// The logged-in person's measurement unit. Inches unless they've chosen
// otherwise (no profile row yet means they haven't).
export async function getMyUnit(): Promise<Unit> {
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("measurement_unit").maybeSingle();
  return data?.measurement_unit === "cm" ? "cm" : "in";
}

export type PublicProfile = { username?: string; isPublic: boolean };

// The logged-in person's public profile settings (Milestone 15a): their
// username, if any, and whether the closet is public (off by default).
export async function getMyPublicProfile(): Promise<PublicProfile> {
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("username, is_public").maybeSingle();
  return { username: data?.username ?? undefined, isPublic: data?.is_public ?? false };
}

// How far through onboarding the logged-in person is (Milestone 15½): 0
// until they've finished or skipped a step. No profile row yet means 0.
export async function getMyOnboardingStep(): Promise<number> {
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("onboarding_step").maybeSingle();
  return data?.onboarding_step ?? 0;
}
