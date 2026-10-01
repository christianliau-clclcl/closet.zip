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

// "Mar 2021"
export function formatMonthYear({ month, year }: MonthYear): string {
  const date = new Date(year, month - 1);
  return date.toLocaleDateString("en", { month: "short", year: "numeric" });
}

// 240 → "$240", 89.5 → "$89.50". Currency is $ for now.
export function formatPrice(price: number): string {
  return price.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: Number.isInteger(price) ? 0 : 2,
  });
}

// "outerwear" → "Outerwear"
export function formatCategory(category: Category): string {
  return category.charAt(0).toUpperCase() + category.slice(1);
}
