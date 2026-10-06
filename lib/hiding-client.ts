import { createClient } from "@/lib/supabase/client";

// Hiding pieces from your public page (Milestone 15b), from the piece's
// details or for many at once in SELECT mode. Row Level Security makes sure
// only your own pieces change. Hiding also takes a piece off sale (16): a
// listed piece is always shown.
export async function setPiecesHidden(itemIds: string[], hidden: boolean): Promise<void> {
  const { error } = await createClient()
    .from("items")
    .update(hidden ? { is_hidden: true, for_sale: false } : { is_hidden: false })
    .in("id", itemIds);
  if (error) throw error;
}
