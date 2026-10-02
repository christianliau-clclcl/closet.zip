import { createClient } from "@/lib/supabase/client";

// Hiding pieces from your public page (Milestone 15b), from the piece's
// details or for many at once in SELECT mode. Row Level Security makes sure
// only your own pieces change.
export async function setPiecesHidden(itemIds: string[], hidden: boolean): Promise<void> {
  const { error } = await createClient().from("items").update({ is_hidden: hidden }).in("id", itemIds);
  if (error) throw error;
}
