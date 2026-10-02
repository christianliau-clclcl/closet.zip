import type { Measurements } from "@/lib/measurements";

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
  colour?: string; // the colour's name, in the person's own words: "Indigo"
  colourHex?: string; // the colour itself, detected or picked: "#2b3a55"
  material?: string;
  acquired?: MonthYear;
  acquiredFrom?: string;
  price?: number;
  size?: string; // as on the label: "M", "32 × 30"
  measurements?: Measurements; // garment measurements, in cm
  notes?: string;
  status: ItemStatus;
  archived?: MonthYear; // when it left the closet
  leftVia?: LeftVia;
  sortPosition?: number; // place in My order for the whole closet; none until arranged
  hidden?: boolean; // left off your public page (Milestone 15b)
};

// A personal folder (Milestone 12). Pieces are linked, never copied, so a
// piece can be in several folders; folders can sit inside folders.
export type Folder = {
  id: string;
  name: string;
  parentId?: string; // the folder it sits in; none for top-level folders
  coverItemId?: string; // a piece chosen as the cover
  coverPath?: string; // an uploaded cover image, in storage
  coverSrc?: string; // its signed link, to show it
  itemIds: string[]; // the pieces directly in it, in the folder's My order
  arranged: boolean; // its pieces have been arranged at least once
  hidden?: boolean; // left off your public page; its pieces still show (15b)
};
