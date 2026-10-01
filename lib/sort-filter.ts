import { formatCategory } from "@/lib/format";
import type { Item } from "@/lib/types";

// Sorting and filtering the closet (PRODUCT.md "Views"). Both live in the
// address (?sort=brand&brand=Levi's&size=M…) so Back, reloading and links keep
// them. Items arrive from the database newest first, so "newest" keeps that
// order.

export const sorts = ["newest", "acquired", "brand", "price"] as const;
export type Sort = (typeof sorts)[number];

export const sortLabels: Record<Sort, string> = {
  newest: "Newest added",
  acquired: "Date acquired",
  brand: "Brand A–Z",
  price: "Price",
};

// Short names for the view bar, e.g. "SORT · BRAND".
export const sortShortLabels: Record<Sort, string> = {
  newest: "Newest",
  acquired: "Acquired",
  brand: "Brand",
  price: "Price",
};

export function readSort(params: URLSearchParams): Sort {
  const value = params.get("sort");
  return sorts.includes(value as Sort) ? (value as Sort) : "newest";
}

// Pieces missing the value being sorted by always go last.
export function sortItems(items: Item[], sort: Sort): Item[] {
  const last = (a: unknown, b: unknown) => Number(a === undefined) - Number(b === undefined);
  const sorted = [...items];
  switch (sort) {
    case "acquired":
      return sorted.sort((a, b) => {
        const missing = last(a.acquired, b.acquired);
        if (missing || !a.acquired || !b.acquired) return missing;
        // Most recent first; a year without a month counts as early that year.
        return b.acquired.year - a.acquired.year || (b.acquired.month ?? 0) - (a.acquired.month ?? 0);
      });
    case "brand":
      return sorted.sort(
        (a, b) => last(a.brand, b.brand) || (a.brand ?? "").localeCompare(b.brand ?? "", "en", { sensitivity: "base" }),
      );
    case "price":
      return sorted.sort((a, b) => last(a.price, b.price) || (b.price ?? 0) - (a.price ?? 0));
    default:
      return sorted;
  }
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
// extra spaces, so "levi's " and "Levi's" match.
function valueOf(item: Item, field: FilterField): string | undefined {
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

export type FilterOption = { value: string; label: string; count: number };

// The options for each field, built from the pieces themselves, so every
// option matches at least one piece. Sorted A–Z (categories in their usual order).
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
            label: field === "category" ? formatCategory(item.category!) : value,
            count: 1,
          });
      }
      const options = [...counts.values()].sort((a, b) =>
        field === "category"
          ? categoryOrder.indexOf(a.value) - categoryOrder.indexOf(b.value)
          : a.label.localeCompare(b.label, "en", { sensitivity: "base", numeric: true }),
      );
      return [field, options];
    }),
  ) as Record<FilterField, FilterOption[]>;
}
