import type { Category } from "@/lib/categories";
import type { Item } from "@/lib/types";

// SHUFFLE (PRODUCT.md 17d): one random top, bottom and pair of shoes from
// the pieces still in your closet. Each part can be kept while the others
// are shuffled again.

export const parts = ["top", "bottom", "shoes"] as const;
export type Part = (typeof parts)[number];

export const partInfo: Record<Part, { label: string; categories: Category[]; none: string }> = {
  top: {
    label: "Top",
    categories: ["tops", "t_shirts", "shirts", "knitwear", "sweatshirts"],
    none: "No tops in your closet yet.",
  },
  bottom: { label: "Bottom", categories: ["trousers", "skirts"], none: "No trousers or skirts in your closet yet." },
  shoes: { label: "Shoes", categories: ["shoes", "sneakers"], none: "No shoes in your closet yet." },
};

export type Pick = Partial<Record<Part, string>>; // item IDs

// The pieces a part can choose from: in the closet, in its categories.
export function choicesFor(items: Item[], part: Part): Item[] {
  return items.filter(
    (item) => item.status === "in_closet" && item.category && partInfo[part].categories.includes(item.category),
  );
}

// A new pick: kept parts stay; the others get a random piece, a different
// one from before when there's a choice. random: Math.random, or a fixed
// sequence for checking.
export function shuffle(items: Item[], previous: Pick = {}, kept: ReadonlySet<Part> = new Set(), random = Math.random): Pick {
  const next: Pick = {};
  for (const part of parts) {
    if (kept.has(part) && previous[part]) {
      next[part] = previous[part];
      continue;
    }
    const choices = choicesFor(items, part);
    const fresh = choices.length > 1 ? choices.filter((item) => item.id !== previous[part]) : choices;
    if (fresh.length > 0) next[part] = fresh[Math.floor(random() * fresh.length)].id;
  }
  return next;
}
