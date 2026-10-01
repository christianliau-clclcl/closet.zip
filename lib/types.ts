// The shape of an item, following the "Item data" table in PRODUCT.md.
// Only the hero photo is required; every other field is optional.

export type Category = "tops" | "bottoms" | "outerwear" | "shoes" | "accessories";

export type ItemStatus = "in_closet" | "archived";

// Dates are stored as month and year only.
export type MonthYear = {
  month: number; // 1–12
  year: number;
};

export type Photo = {
  src: string;
};

export type Item = {
  id: string;
  hero: Photo;
  name?: string;
  category?: Category;
  brand?: string;
  colour?: string;
  material?: string;
  acquired?: MonthYear;
  acquiredFrom?: string;
  price?: number;
  notes?: string;
  status: ItemStatus;
  archived?: MonthYear;
};
