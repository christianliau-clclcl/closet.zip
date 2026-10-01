import type { TablesInsert } from "@/lib/database.types";
import type { Category, Item } from "@/lib/types";

// What's typed into the details form, before it's checked and saved.
// Everything is a string (or empty) while editing; empty means "not filled in".
export type ItemDraft = {
  name: string;
  category: Category | "";
  brand: string;
  colour: string;
  material: string;
  acquiredMonth: string; // "" or "1"–"12"
  acquiredYear: string;
  acquiredFrom: string;
  price: string;
  notes: string;
};

export const emptyDraft: ItemDraft = {
  name: "",
  category: "",
  brand: "",
  colour: "",
  material: "",
  acquiredMonth: "",
  acquiredYear: "",
  acquiredFrom: "",
  price: "",
  notes: "",
};

// A saved item turned back into form fields, for editing.
export function itemToDraft(item: Item): ItemDraft {
  return {
    name: item.name ?? "",
    category: item.category ?? "",
    brand: item.brand ?? "",
    colour: item.colour ?? "",
    material: item.material ?? "",
    acquiredMonth: item.acquired?.month ? String(item.acquired.month) : "",
    acquiredYear: item.acquired ? String(item.acquired.year) : "",
    acquiredFrom: item.acquiredFrom ?? "",
    price: item.price !== undefined ? item.price.toFixed(Number.isInteger(item.price) ? 0 : 2) : "",
    notes: item.notes ?? "",
  };
}

// The item columns the details form fills in.
export type DetailsRow = Omit<TablesInsert<"items">, "id" | "user_id">;

// Checks the draft and turns it into database columns. Returns an error
// message instead if something can't be saved.
export function draftToRow(draft: ItemDraft): { row: DetailsRow } | { error: string } {
  const year = draft.acquiredYear.trim();
  const dateError = checkMonthYear(draft.acquiredMonth, year, "you got it");
  if (dateError) return { error: dateError };

  const price = draft.price.trim().replace(/^\$/, "");
  if (price && !/^\d+(\.\d{1,2})?$/.test(price)) {
    return { error: "The price should be an amount like 120 or 89.50." };
  }

  return {
    row: {
      name: text(draft.name),
      category: draft.category || null,
      brand: text(draft.brand),
      colour: text(draft.colour),
      material: text(draft.material),
      acquired_month: draft.acquiredMonth ? Number(draft.acquiredMonth) : null,
      acquired_year: year ? Number(year) : null,
      acquired_from: text(draft.acquiredFrom),
      price: price ? Number(price) : null,
      notes: text(draft.notes),
    },
  };
}

// Checks a month + year pair from a form. Both are optional, but a month
// needs a year, and the year must be realistic. Returns an error or null.
export function checkMonthYear(month: string, year: string, when: string): string | null {
  const thisYear = new Date().getFullYear();
  if (month && !year) return `Add a year to go with the month ${when}.`;
  if (year && (!/^\d{4}$/.test(year) || Number(year) < 1900 || Number(year) > thisYear)) {
    return `The year should be four digits, between 1900 and ${thisYear}.`;
  }
  return null;
}

// Blank (or only spaces) is saved as empty.
function text(value: string): string | null {
  return value.trim() || null;
}
