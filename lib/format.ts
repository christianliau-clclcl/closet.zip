import type { Category, MonthYear } from "@/lib/types";

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
