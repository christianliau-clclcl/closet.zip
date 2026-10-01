import type { Tables } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";
import type { Category, Item, ItemStatus, MonthYear } from "@/lib/types";

// How long a photo's signed link works. Long enough for a browsing session;
// the page asks for fresh links each time it loads.
const SIGNED_URL_SECONDS = 60 * 60;

type ItemRow = Tables<"items"> & {
  item_photos: Pick<Tables<"item_photos">, "storage_path" | "is_hero">[];
};

// The logged-in person's items, newest first, ready for the grid and overlay.
// Row Level Security already limits the query to their own rows.
export async function getMyItems(): Promise<Item[]> {
  const supabase = await createClient();

  const { data: rows, error } = await supabase
    .from("items")
    .select("*, item_photos(storage_path, is_hero)")
    .order("created_at", { ascending: false });
  if (error) throw error;

  const heroPaths = rows.map(heroPath).filter((path): path is string => Boolean(path));
  if (heroPaths.length === 0) return [];

  // One request for all the signed links, rather than one per photo.
  const { data: signed, error: signError } = await supabase.storage
    .from("item-photos")
    .createSignedUrls(heroPaths, SIGNED_URL_SECONDS);
  if (signError) throw signError;

  const urlByPath = new Map(
    signed.flatMap((s) => (s.path && s.signedUrl ? [[s.path, s.signedUrl] as const] : [])),
  );

  // Every item should have a hero photo; any that doesn't is left out
  // rather than shown as a broken image.
  return rows.flatMap((row) => {
    const path = heroPath(row);
    const url = path && urlByPath.get(path);
    return url ? [toItem(row, url)] : [];
  });
}

function heroPath(row: ItemRow): string | undefined {
  return row.item_photos.find((photo) => photo.is_hero)?.storage_path;
}

// Database rows use snake_case and null for "empty"; the interface uses
// camelCase and leaves empty fields out, so they're hidden automatically.
function toItem(row: ItemRow, heroUrl: string): Item {
  return {
    id: row.id,
    hero: { src: heroUrl, unoptimized: true },
    name: text(row.name),
    category: (row.category as Category | null) ?? undefined,
    brand: text(row.brand),
    colour: text(row.colour),
    material: text(row.material),
    acquired: monthYear(row.acquired_month, row.acquired_year),
    acquiredFrom: text(row.acquired_from),
    price: row.price ?? undefined,
    notes: text(row.notes),
    status: row.status as ItemStatus,
    archived: monthYear(row.archived_month, row.archived_year),
  };
}

// Blank text counts as empty.
function text(value: string | null): string | undefined {
  return value?.trim() ? value : undefined;
}

function monthYear(month: number | null, year: number | null): MonthYear | undefined {
  return year ? { month: month ?? undefined, year } : undefined;
}
