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

// Is a username free? Asks the database, which can see across profiles.
export async function usernameAvailable(username: string): Promise<boolean> {
  const { data, error } = await createClient().rpc("username_available", { p_username: username });
  if (error) throw error;
  return data;
}

// Saves the public profile settings (creating the profile row the first
// time). The database refuses a taken or invalid name, and PUBLIC without
// a username; the error says which.
export async function saveMyPublicProfile(username: string | null, isPublic: boolean): Promise<void> {
  const supabase = createClient();
  const { data } = await supabase.auth.getClaims();
  const id = data?.claims?.sub;
  if (!id) throw new Error("Not logged in");
  const { error } = await supabase.from("profiles").upsert({ id, username, is_public: isPublic });
  if (error) throw error;
}
