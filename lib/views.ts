import type { Item } from "@/lib/types";

// The closet's tabs (PRODUCT.md "13½ Friend feedback round", Milestone 14):
// ALL, FOLDERS and OVERVIEW (FOR SALE joins with Milestone 16), kept in the address as ?view=…
// so Back, reloading and links all keep them. "all" is the default and
// isn't written into the address. How pieces are laid out is SORT BY's job
// (lib/sort-filter.ts).
export const views = ["all", "folders", "overview"] as const;
export type View = (typeof views)[number];

export const viewLabels: Record<View, string> = {
  all: "All",
  folders: "Folders",
  overview: "Overview",
};

export function readView(params: URLSearchParams): View {
  const value = params.get("view");
  return views.includes(value as View) ? (value as View) : "all";
}

// Pieces that have left the closet only show with ARCHIVED · ON (?archived=show).
export function withoutArchived(items: Item[], showArchived: boolean): Item[] {
  return showArchived ? items : items.filter((item) => item.status !== "archived");
}

// The current address with some parts changed; other parts are kept.
// e.g. withParams((p) => p.set("view", "archive")) → "/?view=archive"
export function withParams(update: (params: URLSearchParams) => void): string {
  const params = new URLSearchParams(window.location.search);
  update(params);
  const query = params.toString();
  return query ? `?${query}` : window.location.pathname;
}

// One part changed, or removed with null.
export function withParam(key: string, value: string | null): string {
  return withParams((params) => (value === null ? params.delete(key) : params.set(key, value)));
}
