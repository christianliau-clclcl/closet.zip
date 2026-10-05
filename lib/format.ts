import { categoryInfo } from "@/lib/categories";
import type { Category, Item, MonthYear } from "@/lib/types";

// What to call an item when a name is needed (alt text, screen readers):
// its name, else its category, else "Untitled piece".
export function itemTitle(item: Item): string {
  return item.name ?? (item.category ? formatCategory(item.category) : "Untitled piece");
}

// The one-line summary shown on hover: "Denim jacket · Levi's · 2021".
// Missing parts are skipped; the name can be left out when it's already shown.
export function itemSummary(item: Item, { includeName = true } = {}): string {
  return [includeName ? item.name : undefined, item.brand, item.acquired?.year]
    .filter(Boolean)
    .join(" · ");
}

// The hover label beside the pointer: "Levi's | 2021". Falls back to the name
// when there's no brand or year; archived pieces add how and when they left.
export function hoverLabel(item: Item): string {
  const archived = item.status === "archived" && (leftSummary(item) ?? "Archived");
  return [[item.brand, item.acquired?.year].filter(Boolean).join(" | ") || item.name, archived]
    .filter(Boolean)
    .join(" | ");
}

// "Mar 2021", or just "2021" when there's no month
export function formatMonthYear({ month, year }: MonthYear): string {
  if (!month) return String(year);
  const date = new Date(year, month - 1);
  return date.toLocaleDateString("en", { month: "short", year: "numeric" });
}

// For archived pieces: "Sold, Mar 2026", or just one part if that's all there is.
export function leftSummary(item: Item): string | undefined {
  if (item.status !== "archived") return undefined;
  const how = item.leftVia && item.leftVia.charAt(0).toUpperCase() + item.leftVia.slice(1);
  const when = item.archived && formatMonthYear(item.archived);
  return [how, when].filter(Boolean).join(", ") || undefined;
}

// 240 → "$240", 89.5 → "$89.50". Currency is $ for now.
export function formatPrice(price: number): string {
  return price.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: Number.isInteger(price) ? 0 : 2,
  });
}

// "t_shirts" → "T-Shirts"
export function formatCategory(category: Category): string {
  return categoryInfo[category]?.label ?? category;
}
