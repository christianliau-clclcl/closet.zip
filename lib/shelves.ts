import { averageColour, colourFamily, familyLabels, families } from "@/lib/colour";
import { formatCategory } from "@/lib/format";
import { sortItems } from "@/lib/sort-filter";
import type { Category, Item } from "@/lib/types";

// Shelves (DESIGN.md "Category row"): one labelled, sideways-scrolling row
// per group, like a closet. Used by SORT BY's Type, Colour and Brand.

export type Shelf = {
  key: string;
  label: string;
  items: Item[];
  swatch?: string; // Colour shelves: the average of the pieces on it
};

const categoryOrder: Category[] = ["tops", "bottoms", "outerwear", "shoes", "accessories"];

// One shelf per category in the usual order; pieces without one last.
export function shelvesByType(items: Item[]): Shelf[] {
  return [
    ...categoryOrder.map((category) => ({
      key: category,
      label: formatCategory(category),
      items: items.filter((item) => item.category === category),
    })),
    { key: "none", label: "No category", items: items.filter((item) => !item.category) },
  ].filter((shelf) => shelf.items.length > 0);
}

// One shelf per colour family in gradient order (red … pink, then the
// neutrals), each in gradient order inside and with a swatch averaged from
// its own pieces; pieces without a colour last.
export function shelvesByColour(items: Item[]): Shelf[] {
  const shelves: Shelf[] = families.flatMap((family) => {
    const inFamily = items.filter((item) => item.colourHex && colourFamily(item.colourHex) === family);
    if (inFamily.length === 0) return [];
    return [
      {
        key: family,
        label: familyLabels[family],
        items: sortItems(inFamily, "gradient"),
        swatch: averageColour(inFamily.map((item) => item.colourHex!)),
      },
    ];
  });
  const uncoloured = items.filter((item) => !item.colourHex);
  return uncoloured.length > 0 ? [...shelves, { key: "none", label: "No colour", items: uncoloured }] : shelves;
}

// One shelf per brand, A–Z ("levi's" and "Levi's" are one brand, named as
// first seen); pieces without a brand last.
export function shelvesByBrand(items: Item[]): Shelf[] {
  const byBrand = new Map<string, Shelf>();
  for (const item of items) {
    const brand = item.brand?.trim();
    if (!brand) continue;
    const key = brand.toLowerCase();
    const shelf = byBrand.get(key) ?? { key, label: brand, items: [] };
    shelf.items.push(item);
    byBrand.set(key, shelf);
  }
  const shelves = [...byBrand.values()].sort((a, b) =>
    a.label.localeCompare(b.label, "en", { sensitivity: "base", numeric: true }),
  );
  const unbranded = items.filter((item) => !item.brand?.trim());
  return unbranded.length > 0 ? [...shelves, { key: "none", label: "No brand", items: unbranded }] : shelves;
}
