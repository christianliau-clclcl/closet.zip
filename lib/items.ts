import type { Tables } from "@/lib/database.types";
import { categories } from "@/lib/categories";
import { readMeasurements } from "@/lib/measurements";
import { createClient } from "@/lib/supabase/server";
import type { Category, Item, ItemStatus, LeftVia, MonthYear, Photo } from "@/lib/types";

// How long a photo's signed link works. Long enough for a browsing session;
// the page asks for fresh links each time it loads.
const SIGNED_URL_SECONDS = 60 * 60;

const ITEM_COLUMNS = "*, item_photos(id, storage_path, thumb_path, is_hero, position)";

type PhotoRow = Pick<Tables<"item_photos">, "id" | "storage_path" | "thumb_path" | "is_hero" | "position">;
type ItemRow = Tables<"items"> & { item_photos: PhotoRow[] };
type Supabase = Awaited<ReturnType<typeof createClient>>;

// The logged-in person's items, newest first, with archived pieces after the
// ones still in the closet (until the Archive section exists, Milestone 8).
// Row Level Security already limits the query to their own rows.
export async function getMyItems(): Promise<Item[]> {
  const supabase = await createClient();
  const { data: rows, error } = await supabase
    .from("items")
    .select(ITEM_COLUMNS)
    .order("created_at", { ascending: false });
  if (error) throw error;
  const items = await withPhotos(supabase, rows);
  // A stable sort: each group keeps its newest-first order.
  return items.sort((a, b) => Number(a.status === "archived") - Number(b.status === "archived"));
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

// What the Add and Edit forms suggest, from your own closet (faster logging,
// 2026-10-03): brands (A–Z, for typing) and your usual size per category
// (the one you've used most).
// "Levi's" and "levi's" count as one; the first spelling seen is kept.
export type ClosetHistory = {
  brands: string[];
  usualSizes: Partial<Record<Category, string>>;
};

export async function getMyHistory(): Promise<ClosetHistory> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("items").select("brand, category, size_label");
  if (error) throw error;

  // Counts each spelling-insensitive value, keeping its first spelling.
  const tally = (values: (string | null)[]) => {
    const counts = new Map<string, { name: string; count: number }>();
    for (const value of values) {
      const name = value?.trim();
      if (!name) continue;
      const entry = counts.get(name.toLowerCase()) ?? { name, count: 0 };
      entry.count++;
      counts.set(name.toLowerCase(), entry);
    }
    return [...counts.values()];
  };
  const byUse = (list: { name: string; count: number }[]) =>
    list.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)).map((entry) => entry.name);

  const usualSizes: Partial<Record<Category, string>> = {};
  for (const category of categories) {
    const [usual] = byUse(tally(data.filter((row) => row.category === category).map((row) => row.size_label)));
    if (usual) usualSizes[category] = usual;
  }

  return {
    brands: tally(data.map((row) => row.brand))
      .map((entry) => entry.name)
      .sort((a, b) => a.localeCompare(b)),
    usualSizes,
  };
}

// Adds signed links (full size and thumbnail) for every photo of each item.
// Photos whose file is missing are skipped; items left without a hero are
// left out rather than shown as broken images.
async function withPhotos(supabase: Supabase, rows: ItemRow[]): Promise<Item[]> {
  const paths = rows.flatMap((row) =>
    row.item_photos.flatMap((p) => [p.storage_path, p.thumb_path].filter((x): x is string => Boolean(x))),
  );
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
    const photos = displayOrder(row.item_photos).flatMap((p): Photo[] => {
      const src = urlByPath.get(p.storage_path);
      if (!src) return [];
      const thumbSrc = p.thumb_path ? urlByPath.get(p.thumb_path) : undefined;
      return [{ id: p.id, isHero: p.is_hero, position: p.position, src, thumbSrc, unoptimized: true }];
    });
    const hero = photos.find((p) => p.isHero);
    return hero ? [toItem(row, hero, photos)] : [];
  });
}

// The hero first (it's the cover), then the rest in the order chosen.
function displayOrder(photos: PhotoRow[]): PhotoRow[] {
  return [...photos].sort((a, b) => Number(b.is_hero) - Number(a.is_hero) || a.position - b.position);
}

// Database rows use snake_case and null for "empty"; the interface uses
// camelCase and leaves empty fields out, so they're hidden automatically.
function toItem(row: ItemRow, hero: Photo, photos: Photo[]): Item {
  return {
    id: row.id,
    hero,
    photos,
    name: text(row.name),
    category: (row.category as Category | null) ?? undefined,
    brand: text(row.brand),
    colour: text(row.colour),
    colourHex: text(row.colour_hex),
    material: text(row.material),
    acquired: monthYear(row.acquired_month, row.acquired_year),
    acquiredFrom: text(row.acquired_from),
    price: row.price ?? undefined,
    size: text(row.size_label),
    measurements: readMeasurements(row.measurements),
    notes: text(row.notes),
    status: row.status as ItemStatus,
    archived: monthYear(row.archived_month, row.archived_year),
    leftVia: (row.left_via as LeftVia | null) ?? undefined,
    sortPosition: row.sort_position ?? undefined,
    hidden: row.is_hidden || undefined,
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
