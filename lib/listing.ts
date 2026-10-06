import { measurementLabels, measurementRows } from "@/lib/measurements";
import type { Item } from "@/lib/types";

// Selling from your closet (PRODUCT.md Milestone 16). A listing adds an
// asking price (separate from what you paid, which stays private), a
// condition and an optional note. The database also checks these
// (items_listing_complete, items_listing_shown).

export const conditions = ["new_with_tags", "like_new", "good", "worn"] as const;
export type Condition = (typeof conditions)[number];

export const conditionLabels: Record<Condition, string> = {
  new_with_tags: "New with tags",
  like_new: "Like new",
  good: "Good",
  worn: "Worn",
};

export type Listing = { askingPrice: number; condition: Condition; note?: string };

export const MAX_SALE_NOTE = 200;

// What a piece still needs before it can be listed (decided 2026-10-05:
// measurements are required for listings, the one exception to "every
// field is optional"): a category, the size label, and every measurement
// row for its category. Shoes and sneakers have no rows, so the size label
// is enough. Asking price and condition are asked for in the listing itself.
export function missingForListing(item: Item): string[] {
  if (!item.category) return ["Category"];
  const missing: string[] = [];
  if (!item.size?.trim()) missing.push("Size");
  for (const key of measurementRows(item.category)) {
    if (item.measurements?.[key] === undefined) missing.push(measurementLabels[key]);
  }
  return missing;
}
