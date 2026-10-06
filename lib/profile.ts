import { readCategories, readUsualSizes, type Category, type UsualSizes } from "@/lib/categories";
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

// What you told onboarding (15¼b): the categories you ticked (none if you
// haven't answered) and your usual size for each kind of size.
export type ClosetSetup = { categories?: Category[]; sizes: UsualSizes };

export async function getMyClosetSetup(): Promise<ClosetSetup> {
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("closet_categories, usual_sizes").maybeSingle();
  return { categories: readCategories(data?.closet_categories), sizes: readUsualSizes(data?.usual_sizes) };
}
