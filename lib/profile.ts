import type { Unit } from "@/lib/measurements";
import { createClient } from "@/lib/supabase/server";

// The logged-in person's measurement unit. Inches unless they've chosen
// otherwise (no profile row yet means they haven't).
export async function getMyUnit(): Promise<Unit> {
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("measurement_unit").maybeSingle();
  return data?.measurement_unit === "cm" ? "cm" : "in";
}
