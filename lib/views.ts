import type { Item } from "@/lib/types";

// The closet's views (PRODUCT.md "Views"), kept in the address as ?view=…
// so Back, reloading and links all keep them. "all" is the default and
// isn't written into the address. More views join as they're built.
export const views = ["all", "folders", "rows", "archive"] as const;
export type View = (typeof views)[number];

export const viewLabels: Record<View, string> = {
  all: "All",
  folders: "Folders",
  rows: "Rows",
  archive: "Archive",
};

export function readView(params: URLSearchParams): View {
  const value = params.get("view");
  return views.includes(value as View) ? (value as View) : "all";
}

// The pieces a view shows: ALL and ROWS are what's still in the closet;
// ARCHIVE is what has left it. (FOLDERS shows a folder's own pieces; see
// itemsInFolder in lib/folder-tree.ts.)
export function itemsInView(items: Item[], view: View): Item[] {
  return items.filter((item) => (view === "archive") === (item.status === "archived"));
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
