// The category list (PRODUCT.md 15¼, decided 2026-10-05): fixed, in
// head-to-toe order, the one place the categories are written down. The
// Add/Edit chips, Type shelves and the filter all follow this order. The
// database accepts exactly these values (items_category_check), so a change
// here needs a migration too.
export const categories = [
  "tops",
  "t_shirts",
  "shirts",
  "knitwear",
  "sweatshirts",
  "jackets",
  "dresses",
  "trousers",
  "skirts",
  "shoes",
  "sneakers",
  "bags",
  "sunglasses",
  "accessories",
] as const;

export type Category = (typeof categories)[number];

// Which measurement rows a category gets (lib/measurements.ts): the top rows,
// the bottom rows, width/height/depth for objects, or none (the size label
// covers shoes).
export type MeasurementSet = "top" | "bottom" | "object" | "none";

export const categoryInfo: Record<Category, { label: string; measurements: MeasurementSet }> = {
  tops: { label: "Tops", measurements: "top" },
  t_shirts: { label: "T-Shirts", measurements: "top" },
  shirts: { label: "Shirts", measurements: "top" },
  knitwear: { label: "Knitwear", measurements: "top" },
  sweatshirts: { label: "Sweatshirts", measurements: "top" },
  jackets: { label: "Jackets", measurements: "top" },
  dresses: { label: "Dresses", measurements: "top" },
  trousers: { label: "Trousers", measurements: "bottom" },
  skirts: { label: "Skirts", measurements: "bottom" },
  shoes: { label: "Shoes", measurements: "none" },
  sneakers: { label: "Sneakers", measurements: "none" },
  bags: { label: "Bags", measurements: "object" },
  sunglasses: { label: "Sunglasses", measurements: "object" },
  accessories: { label: "Accessories", measurements: "object" },
};

// The old five's new names, for old links (?category=bottoms).
export const renamedCategories: Record<string, Category> = {
  bottoms: "trousers",
  outerwear: "jackets",
};
