import type { Condition } from "@/lib/listing";
import { createClient } from "@/lib/supabase/client";

// Listing, changing and ending a sale from the browser (Milestone 16). Row
// Level Security makes sure only your own pieces change; the database
// refuses an incomplete listing, or a hidden or archived one.

// Lists the piece (or updates its listing). A listed piece is always shown,
// so this also un-hides it.
export async function listPiece(
  itemId: string,
  listing: { askingPrice: number; condition: Condition; note: string },
): Promise<void> {
  const { error } = await createClient()
    .from("items")
    .update({
      for_sale: true,
      is_hidden: false,
      asking_price: listing.askingPrice,
      condition: listing.condition,
      sale_note: listing.note.trim() || null,
    })
    .eq("id", itemId);
  if (error) throw error;
}

// Takes it off sale; the price, condition and note are kept for next time.
export async function unlistPiece(itemId: string): Promise<void> {
  const { error } = await createClient().from("items").update({ for_sale: false }).eq("id", itemId);
  if (error) throw error;
}

// MARK SOLD: off sale and archived as Sold, this month, in one go.
export async function markSold(itemId: string): Promise<void> {
  const now = new Date();
  const { error } = await createClient()
    .from("items")
    .update({
      for_sale: false,
      status: "archived",
      archived_month: now.getMonth() + 1,
      archived_year: now.getFullYear(),
      left_via: "sold",
    })
    .eq("id", itemId);
  if (error) throw error;
}
