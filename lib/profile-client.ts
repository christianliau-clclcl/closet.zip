import type { Unit } from "@/lib/measurements";
import { createClient } from "@/lib/supabase/client";

// Remembers the person's unit choice in their profile (creating it the first
// time). Best effort: if it fails, the switch still works for this visit.
export async function saveMyUnit(unit: Unit) {
  const supabase = createClient();
  const { data } = await supabase.auth.getClaims();
  const id = data?.claims?.sub;
  if (!id) return;
  await supabase.from("profiles").upsert({ id, measurement_unit: unit });
}
