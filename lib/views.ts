import type { Item } from "@/lib/types";

// The closet's views (PRODUCT.md "Views"), kept in the address as ?view=…
// so Back, reloading and links all keep them. "all" is the default and
// isn't written into the address. More views join as they're built.
export const views = ["all", "rows", "archive"] as const;
export type View = (typeof views)[number];

export const viewLabels: Record<View, string> = {
  all: "All",
  rows: "Rows",
  archive: "Archive",
};

export function readView(params: URLSearchParams): View {
  const value = params.get("view");
  return views.includes(value as View) ? (value as View) : "all";
}

// The pieces a view shows: ALL and ROWS are what's still in the closet;
// ARCHIVE is what has left it.
export function itemsInView(items: Item[], view: View): Item[] {
  return items.filter((item) => (view === "archive") === (item.status === "archived"));
}

// The current address with one part changed (or removed, with null), e.g.
// withParam("view", "archive") → "/?view=archive". Other parts are kept.
export function withParam(key: string, value: string | null): string {
  const params = new URLSearchParams(window.location.search);
  if (value === null) params.delete(key);
  else params.set(key, value);
  const query = params.toString();
  return query ? `?${query}` : window.location.pathname;
}
