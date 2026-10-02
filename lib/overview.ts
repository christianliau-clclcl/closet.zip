import { averageColour } from "@/lib/colour";
import type { Item } from "@/lib/types";

// OVERVIEW (Milestone 14): summaries of the closet, made from the pieces'
// own details. Pure logic, no drawing.

export type Group = { key: string; label: string; items: Item[]; swatch?: string };

// Pieces grouped by a word typed for them ("levi's" and "Levi's" are one,
// named as first seen), most pieces first, then A–Z. Pieces without one come
// last, under `noneLabel`.
function groupByName(items: Item[], nameOf: (item: Item) => string | undefined, noneLabel: string): Group[] {
  const groups = new Map<string, Group>();
  for (const item of items) {
    const name = nameOf(item)?.trim();
    if (!name) continue;
    const key = name.toLowerCase();
    const group = groups.get(key) ?? { key, label: name, items: [] };
    group.items.push(item);
    groups.set(key, group);
  }
  const named = [...groups.values()].sort(
    (a, b) => b.items.length - a.items.length || a.label.localeCompare(b.label, "en", { sensitivity: "base" }),
  );
  const unnamed = items.filter((item) => !nameOf(item)?.trim());
  return unnamed.length > 0 ? [...named, { key: "none", label: noneLabel, items: unnamed }] : named;
}

// By colour (14a): grouped by the colour name typed ("Black", "Charcoal"…),
// each with a swatch averaged from its pieces' detected colours.
export function byColourName(items: Item[]): Group[] {
  return groupByName(items, (item) => item.colour, "No colour name").map((group) => {
    const hexes = group.items.flatMap((item) => (item.colourHex ? [item.colourHex] : []));
    return hexes.length > 0 ? { ...group, swatch: averageColour(hexes) } : group;
  });
}

// Brands (14c): your most-owned brands first.
export function byBrand(items: Item[]): Group[] {
  return groupByName(items, (item) => item.brand, "No brand");
}
