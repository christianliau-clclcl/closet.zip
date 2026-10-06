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

// Which kind of size a category takes (onboarding step 3, 15¼b): a letter
// size, a waist, a shoe size, or none (bags, sunglasses, accessories).
export type SizeKind = "letter" | "waist" | "shoe";

export const categoryInfo: Record<
  Category,
  { label: string; measurements: MeasurementSet; size: SizeKind | null }
> = {
  tops: { label: "Tops", measurements: "top", size: "letter" },
  t_shirts: { label: "T-Shirts", measurements: "top", size: "letter" },
  shirts: { label: "Shirts", measurements: "top", size: "letter" },
  knitwear: { label: "Knitwear", measurements: "top", size: "letter" },
  sweatshirts: { label: "Sweatshirts", measurements: "top", size: "letter" },
  jackets: { label: "Jackets", measurements: "top", size: "letter" },
  dresses: { label: "Dresses", measurements: "top", size: "letter" },
  trousers: { label: "Trousers", measurements: "bottom", size: "waist" },
  skirts: { label: "Skirts", measurements: "bottom", size: "waist" },
  shoes: { label: "Shoes", measurements: "none", size: "shoe" },
  sneakers: { label: "Sneakers", measurements: "none", size: "shoe" },
  bags: { label: "Bags", measurements: "object", size: null },
  sunglasses: { label: "Sunglasses", measurements: "object", size: null },
  accessories: { label: "Accessories", measurements: "object", size: null },
};

// The kinds of size in onboarding's "Your sizes", in order. Each offers one
// or more sizing systems (decided 2026-10-05: shoes US · UK · EU, tops
// LETTER · EU · NUMBERED; waist and women's sizes typed via OTHER… for now).
// A size is saved as text with its system in front ("EU 43", "US 9.5"), so
// it reads the same anywhere; letter, numbered and waist sizes stay bare.
export const sizeKinds: readonly SizeKind[] = ["letter", "waist", "shoe"];

export type SizeSystem = { key: string; label: string; prefix: string; options: string[] };

const range = (from: number, to: number, step = 1) =>
  Array.from({ length: Math.round((to - from) / step) + 1 }, (_, i) => String(from + i * step));

export const sizeKindInfo: Record<SizeKind, { label: string; systems: SizeSystem[] }> = {
  letter: {
    label: "Tops size",
    systems: [
      { key: "letter", label: "Letter", prefix: "", options: ["XS", "S", "M", "L", "XL", "XXL"] },
      { key: "eu", label: "EU", prefix: "EU ", options: range(44, 56, 2) },
      { key: "numbered", label: "Numbered", prefix: "", options: range(0, 5) },
    ],
  },
  waist: {
    label: "Waist",
    systems: [{ key: "in", label: "In", prefix: "", options: ["28", "29", "30", "31", "32", "33", "34", "36"] }],
  },
  shoe: {
    label: "Shoe size",
    systems: [
      { key: "us", label: "US", prefix: "US ", options: range(7, 12, 0.5) },
      { key: "uk", label: "UK", prefix: "UK ", options: range(6, 11, 0.5) },
      { key: "eu", label: "EU", prefix: "EU ", options: range(39, 46) },
    ],
  },
};

// Which system a saved size belongs to ("EU 43" → EU), and its chip value
// ("43"); a size that matches no chip is OTHER… in the first system.
export function sizeSystemOf(kind: SizeKind, size: string | undefined): { system: SizeSystem; chip?: string } {
  const systems = sizeKindInfo[kind].systems;
  if (size) {
    for (const system of systems) {
      if (system.prefix && !size.startsWith(system.prefix)) continue;
      const chip = size.slice(system.prefix.length);
      if (system.options.includes(chip)) return { system, chip };
    }
    const prefixed = systems.find((system) => system.prefix && size.startsWith(system.prefix));
    if (prefixed) return { system: prefixed };
  }
  return { system: systems[0] };
}

// "Tops, T-shirts, shirts…": the categories a kind of size covers.
export function categoriesWithSize(kind: SizeKind): Category[] {
  return categories.filter((category) => categoryInfo[category].size === kind);
}

// The categories you ticked in onboarding, in list order; unknown values
// (from an older list) are dropped.
export function readCategories(values: readonly string[] | null | undefined): Category[] | undefined {
  if (!values) return undefined;
  return categories.filter((category) => values.includes(category));
}

export type UsualSizes = Partial<Record<SizeKind, string>>;

export function readUsualSizes(value: unknown): UsualSizes {
  const sizes: UsualSizes = {};
  if (value && typeof value === "object" && !Array.isArray(value)) {
    for (const kind of sizeKinds) {
      const size = (value as Record<string, unknown>)[kind];
      if (typeof size === "string" && size.trim()) sizes[kind] = size.trim();
    }
  }
  return sizes;
}

// The old five's new names, for old links (?category=bottoms).
export const renamedCategories: Record<string, Category> = {
  bottoms: "trousers",
  outerwear: "jackets",
};
