import type { Tables } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";
import type { Category, Item, ItemStatus, MonthYear } from "@/lib/types";

// How long a photo's signed link works. Long enough for a browsing session;
// the page asks for fresh links each time it loads.
const SIGNED_URL_SECONDS = 60 * 60;

const ITEM_COLUMNS = "*, item_photos(storage_path, thumb_path, is_hero)";

type PhotoRow = Pick<Tables<"item_photos">, "storage_path" | "thumb_path" | "is_hero">;
type ItemRow = Tables<"items"> & { item_photos: PhotoRow[] };
type Supabase = Awaited<ReturnType<typeof createClient>>;

// The logged-in person's items, newest first, ready for the grid and overlay.
// Row Level Security already limits the query to their own rows.
export async function getMyItems(): Promise<Item[]> {
  const supabase = await createClient();
  const { data: rows, error } = await supabase
    .from("items")
    .select(ITEM_COLUMNS)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return withPhotos(supabase, rows);
}

// One of the logged-in person's items, or null if it doesn't exist or isn't
// theirs (Row Level Security makes other people's items invisible).
export async function getMyItem(id: string): Promise<Item | null> {
  if (!isUuid(id)) return null;
  const supabase = await createClient();
  const { data: row, error } = await supabase.from("items").select(ITEM_COLUMNS).eq("id", id).maybeSingle();
  if (error) throw error;
  if (!row) return null;
  const [item] = await withPhotos(supabase, [row]);
  return item ?? null;
}

// Brands already used in this closet, for suggestions while typing.
// "Levi's" and "levi's" count as one; the first spelling seen is kept.
export async function getMyBrands(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("items").select("brand").not("brand", "is", null);
  if (error) throw error;

  const byKey = new Map<string, string>();
  for (const { brand } of data) {
    const trimmed = brand?.trim();
    if (trimmed && !byKey.has(trimmed.toLowerCase())) byKey.set(trimmed.toLowerCase(), trimmed);
  }
  return [...byKey.values()].sort((a, b) => a.localeCompare(b));
}

// Adds signed photo links (full size and thumbnail) to item rows.
// Items without a hero photo, or whose file is missing, are left out rather
// than shown as broken images.
async function withPhotos(supabase: Supabase, rows: ItemRow[]): Promise<Item[]> {
  const paths = rows.flatMap((row) => {
    const hero = heroPhoto(row);
    return hero ? [hero.storage_path, hero.thumb_path].filter((p): p is string => Boolean(p)) : [];
  });
  if (paths.length === 0) return [];

  // One request for all the signed links, rather than one per photo.
  const { data: signed, error } = await supabase.storage
    .from("item-photos")
    .createSignedUrls(paths, SIGNED_URL_SECONDS);
  if (error) throw error;

  const urlByPath = new Map(
    signed.flatMap((s) => (s.path && s.signedUrl ? [[s.path, s.signedUrl] as const] : [])),
  );

  return rows.flatMap((row) => {
    const hero = heroPhoto(row);
    const src = hero && urlByPath.get(hero.storage_path);
    if (!src) return [];
    const thumbSrc = hero.thumb_path ? urlByPath.get(hero.thumb_path) : undefined;
    return [toItem(row, src, thumbSrc)];
  });
}

function heroPhoto(row: ItemRow): PhotoRow | undefined {
  return row.item_photos.find((photo) => photo.is_hero);
}

// Database rows use snake_case and null for "empty"; the interface uses
// camelCase and leaves empty fields out, so they're hidden automatically.
function toItem(row: ItemRow, src: string, thumbSrc: string | undefined): Item {
  return {
    id: row.id,
    hero: { src, thumbSrc, unoptimized: true },
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

// Item IDs are UUIDs; anything else in an address can't be an item.
function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}
