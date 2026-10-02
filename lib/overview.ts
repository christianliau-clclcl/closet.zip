import { averageColour } from "@/lib/colour";
import type { Item } from "@/lib/types";

// OVERVIEW (Milestone 14): summaries of the closet, made from the pieces'
// own details. Pure logic, no drawing.

export type Group = { key: string; label: string; items: Item[]; swatch?: string };

// Pieces grouped by the colour name typed for them ("Black", "Charcoal"…;
// "black" and "Black" are one), most pieces first, then A–Z. Each group's
// swatch is the average of its pieces' detected colours. Pieces without a
// colour name come last.
export function byColourName(items: Item[]): Group[] {
  const groups = new Map<string, Group>();
  for (const item of items) {
    const name = item.colour?.trim();
    if (!name) continue;
    const key = name.toLowerCase();
    const group = groups.get(key) ?? { key, label: name, items: [] };
    group.items.push(item);
    groups.set(key, group);
  }
  const named = [...groups.values()]
    .sort((a, b) => b.items.length - a.items.length || a.label.localeCompare(b.label, "en", { sensitivity: "base" }))
    .map((group) => {
      const hexes = group.items.flatMap((item) => (item.colourHex ? [item.colourHex] : []));
      return hexes.length > 0 ? { ...group, swatch: averageColour(hexes) } : group;
    });
  const unnamed = items.filter((item) => !item.colour?.trim());
  return unnamed.length > 0 ? [...named, { key: "none", label: "No colour name", items: unnamed }] : named;
}
