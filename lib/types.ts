// The shape of an item, following the "Item data" table in PRODUCT.md.
// Only the hero photo is required; every other field is optional.

export type Category = "tops" | "bottoms" | "outerwear" | "shoes" | "accessories";

export type ItemStatus = "in_closet" | "archived";

// How an archived piece left the closet.
export type LeftVia = "sold" | "donated" | "gifted" | "lost" | "other";

// Dates are stored as month and year only.
export type MonthYear = {
  month?: number; // 1–12; optional, since "sometime in 2019" is allowed
  year: number;
};

export type Photo = {
  id?: string; // the item_photos row (database photos only)
  isHero?: boolean;
  position?: number; // order among the item's photos (database photos only)
  src: string; // full size, for the overlay
  thumbSrc?: string; // small version for the grid, when there is one
  // True for photos from Supabase Storage: they're already resized before
  // upload, and their signed links change each visit, so Next.js shouldn't
  // try to resize them again on the server.
  unoptimized?: boolean;
};

export type Item = {
  id: string;
  hero: Photo; // the cover photo, shown in the grid
  photos?: Photo[]; // every photo in display order, hero first (database items)
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
  archived?: MonthYear; // when it left the closet
  leftVia?: LeftVia;
};
