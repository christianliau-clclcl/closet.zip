import { averageColour, colourFamily, familyLabels, families, toHsv, type Family } from "@/lib/colour";
import { formatCategory } from "@/lib/format";
import type { Item } from "@/lib/types";

// Sorting and filtering the closet (PRODUCT.md "Views", "13½ Friend
// feedback round"). SORT BY picks both the order and the layout: most sorts
// are a grid, Timeline is the timeline and Type is shelves per category.
// Both live in the address (?sort=brand&brand=Levi's&size=M…) so Back,
// reloading and links keep them. Items arrive from the database newest
// first, so "newest" keeps that order.

// "family" is the Colour shelves (?sort=colour meant the gradient before).
export const sorts = ["mine", "newest", "time", "type", "family", "gradient", "brand", "price"] as const;
export type Sort = (typeof sorts)[number];

export const sortLabels: Record<Sort, string> = {
  mine: "My order",
  newest: "Newest added",
  time: "Timeline",
  type: "Type",
  family: "Colour",
  gradient: "Colour gradient",
  brand: "Brand",
  price: "Price",
};

// Short names for the bar, e.g. "SORT BY · BRAND".
export const sortShortLabels: Record<Sort, string> = {
  mine: "My order",
  newest: "Newest",
  time: "Timeline",
  type: "Type",
  family: "Colour",
  gradient: "Gradient",
  brand: "Brand",
  price: "Price",
};

// How each sort lays pieces out.
export type Layout = "grid" | "timeline" | "shelves";
export function layoutOf(sort: Sort): Layout {
  return sort === "time" ? "timeline" : sort === "type" || sort === "family" || sort === "brand" ? "shelves" : "grid";
}

// Old links (before SORT BY, 2026-10-02) in today's terms: ?view=rows is
// Type, ?view=time is Timeline (which showed archived pieces), ?view=archive
// shows archived pieces, ?sort=acquired is Timeline, ?sort=colour is the
// gradient. Returns the updated address, or null when nothing is old.
export function upgradeOldAddress(search: string): string | null {
  const params = new URLSearchParams(search);
  const before = params.toString();
  const view = params.get("view");
  if (view === "rows") {
    params.delete("view");
    params.set("sort", "type");
  } else if (view === "time") {
    params.delete("view");
    params.set("sort", "time");
    if (params.get("archived") !== "hide") params.set("archived", "show");
  } else if (view === "archive") {
    params.delete("view");
    params.set("archived", "show");
  }
  if (params.get("archived") === "hide") params.delete("archived");
  if (params.get("sort") === "acquired") params.set("sort", "time");
  if (params.get("sort") === "colour") params.set("sort", "gradient");
  const after = params.toString();
  return after === before ? null : after ? `?${after}` : window.location.pathname;
}

// The sort in the address, or the default: My order once the closet (or the
// open folder) has been arranged, else Newest added (PRODUCT.md Milestone 12).
export function readSort(params: URLSearchParams, fallback: Sort): Sort {
  const value = params.get("sort");
  return sorts.includes(value as Sort) ? (value as Sort) : fallback;
}

// Pieces missing the value being sorted by always go last. myOrder: a
// folder's own order (its piece IDs); without it, My order is the closet's,
// where pieces not arranged yet come first, newest first.
export function sortItems(items: Item[], sort: Sort, myOrder?: string[]): Item[] {
  const last = (a: unknown, b: unknown) => Number(a === undefined) - Number(b === undefined);
  const sorted = [...items];
  switch (sort) {
    case "brand":
      return sorted.sort(
        (a, b) => last(a.brand, b.brand) || (a.brand ?? "").localeCompare(b.brand ?? "", "en", { sensitivity: "base" }),
      );
    case "price":
      return sorted.sort((a, b) => last(a.price, b.price) || (b.price ?? 0) - (a.price ?? 0));
    case "mine":
      if (myOrder) {
        const place = new Map(myOrder.map((id, index) => [id, index]));
        return sorted.sort((a, b) => (place.get(a.id) ?? -1) - (place.get(b.id) ?? -1));
      }
      return sorted.sort((a, b) => (a.sortPosition ?? -1) - (b.sortPosition ?? -1));
    case "gradient":
      return sorted.sort((a, b) => {
        const missing = last(a.colourHex, b.colourHex);
        if (missing || !a.colourHex || !b.colourHex) return missing;
        const [ka, kb] = [colourKey(a.colourHex), colourKey(b.colourHex)];
        return ka.family - kb.family || ka.within - kb.within;
      });
    default:
      return sorted;
  }
}

// Where a colour goes in the gradient (PRODUCT.md "Colour order"): by family,
// then by hue within a colourful family, and by brightness among the
// neutrals, so the end fades chocolate → beige → white → grey → black.
function colourKey(hex: string): { family: number; within: number } {
  const family = colourFamily(hex);
  const { hue, value } = toHsv(hex);
  let within: number;
  if (family === "brown") within = value; // dark to light, into white
  else if (family === "white" || family === "grey" || family === "black") within = -value; // light to dark
  else within = hue >= 300 && family === "red" ? hue - 360 : hue; // wine reds start the reds
  return { family: families.indexOf(family), within };
}

// ---------------------------------------------------------------------------

export const filterFields = ["category", "brand", "size", "colour"] as const;
export type FilterField = (typeof filterFields)[number];
export type Filters = Record<FilterField, string[]>;

export const filterLabels: Record<FilterField, string> = {
  category: "Category",
  brand: "Brand",
  size: "Size",
  colour: "Colour",
};

export const noFilters: Filters = { category: [], brand: [], size: [], colour: [] };

export function readFilters(params: URLSearchParams): Filters {
  return Object.fromEntries(filterFields.map((field) => [field, params.getAll(field)])) as Filters;
}

export function countFilters(filters: Filters): number {
  return filterFields.reduce((total, field) => total + filters[field].length, 0);
}

// The text a piece has for a field, compared without caring about case or
// extra spaces, so "levi's " and "Levi's" match. Colour filters by family
// ("blue"), worked out from the colour itself, not the name people typed.
function valueOf(item: Item, field: FilterField): string | undefined {
  if (field === "colour") return item.colourHex ? colourFamily(item.colourHex) : undefined;
  return item[field]?.trim() || undefined;
}
const same = (a: string, b: string) => a.localeCompare(b, "en", { sensitivity: "base" }) === 0;

// Within a field, any chosen value matches ("or"); across fields, all must
// match ("and"). No values chosen for a field means that field doesn't filter.
export function filterItems(items: Item[], filters: Filters): Item[] {
  return items.filter((item) =>
    filterFields.every((field) => {
      const chosen = filters[field];
      if (chosen.length === 0) return true;
      const value = valueOf(item, field);
      return value !== undefined && chosen.some((c) => same(c, value));
    }),
  );
}

export type FilterOption = {
  value: string;
  label: string;
  count: number;
  swatch?: string; // colour families: the average of the pieces in it
};

// The options for each field, built from the pieces themselves, so every
// option matches at least one piece. Sorted A–Z (categories in their usual
// order, colour families in gradient order).
export function filterOptions(items: Item[]): Record<FilterField, FilterOption[]> {
  const categoryOrder = ["tops", "bottoms", "outerwear", "shoes", "accessories"];
  return Object.fromEntries(
    filterFields.map((field) => {
      const counts = new Map<string, FilterOption>();
      for (const item of items) {
        const value = valueOf(item, field);
        if (!value) continue;
        const key = value.toLowerCase();
        const existing = counts.get(key);
        if (existing) existing.count += 1;
        else
          counts.set(key, {
            value,
            label:
              field === "category"
                ? formatCategory(item.category!)
                : field === "colour"
                  ? familyLabels[value as Family]
                  : value,
            count: 1,
          });
      }
      const options = [...counts.values()].sort((a, b) =>
        field === "category"
          ? categoryOrder.indexOf(a.value) - categoryOrder.indexOf(b.value)
          : field === "colour"
            ? families.indexOf(a.value as Family) -
              families.indexOf(b.value as Family)
            : a.label.localeCompare(b.label, "en", { sensitivity: "base", numeric: true }),
      );
      if (field === "colour") {
        for (const option of options) {
          const hexes = items.flatMap((item) =>
            item.colourHex && colourFamily(item.colourHex) === option.value ? [item.colourHex] : [],
          );
          option.swatch = averageColour(hexes);
        }
      }
      return [field, options];
    }),
  ) as Record<FilterField, FilterOption[]>;
}
