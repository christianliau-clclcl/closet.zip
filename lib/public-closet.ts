import { cache } from "react";
import type { Category } from "@/lib/categories";
import type { Condition } from "@/lib/listing";
import { readMeasurements } from "@/lib/measurements";
import { createClient } from "@/lib/supabase/server";
import type { Folder, Item, Photo } from "@/lib/types";

// A public closet (Milestone 15d), read through the public door (15c): the
// database functions public_profile, public_items and public_folders, which
// only answer for a PUBLIC profile and only return visible pieces and
// folders with catalogue fields. Called as whoever is visiting (logged out
// or in); photos come as signed links, allowed by the storage rule for
// public photos.

const SIGNED_URL_SECONDS = 60 * 60;

export type PublicCloset = {
  username: string;
  closetName?: string;
  forSaleOnly: boolean; // PUBLIC · FOR SALE ONLY: only listings are shown (16)
  saleContact?: string; // how buyers get in touch, in the owner's words
  items: Item[];
  folders: Folder[];
};

type PhotoJson = { id: string; storage_path: string; thumb_path: string | null; is_hero: boolean; position: number };
type FolderItemJson = { item_id: string; position: number | null; created_at: string };

// null for a private profile or a username that doesn't exist (the door
// can't tell them apart, on purpose). cache: the page and its title share
// one load per visit.
export const getPublicCloset = cache(async (username: string): Promise<PublicCloset | null> => {
  const supabase = await createClient();
  const { data: profiles, error } = await supabase.rpc("public_profile", { p_username: username });
  if (error) throw error;
  const profile = profiles?.[0];
  if (!profile) return null;

  const [{ data: itemRows, error: itemsError }, { data: folderRows, error: foldersError }] = await Promise.all([
    supabase.rpc("public_items", { p_username: username }),
    supabase.rpc("public_folders", { p_username: username }),
  ]);
  if (itemsError) throw itemsError;
  if (foldersError) throw foldersError;

  // One request for every photo's and cover's signed link.
  const paths = [
    ...itemRows.flatMap((row) =>
      (row.photos as PhotoJson[]).flatMap((p) => [p.storage_path, p.thumb_path ?? []].flat()),
    ),
    ...folderRows.flatMap((row) => (row.cover_path ? [row.cover_path] : [])),
  ];
  const urlByPath = new Map<string, string>();
  if (paths.length > 0) {
    const { data: signed } = await supabase.storage.from("item-photos").createSignedUrls(paths, SIGNED_URL_SECONDS);
    for (const s of signed ?? []) if (s.path && s.signedUrl) urlByPath.set(s.path, s.signedUrl);
  }

  const items = itemRows.flatMap((row): Item[] => {
    // Already hero first, then in order (the database sorts them).
    const photos = (row.photos as PhotoJson[]).flatMap((p): Photo[] => {
      const src = urlByPath.get(p.storage_path);
      if (!src) return [];
      const thumbSrc = p.thumb_path ? urlByPath.get(p.thumb_path) : undefined;
      return [{ id: p.id, isHero: p.is_hero, position: p.position, src, thumbSrc, unoptimized: true }];
    });
    const hero = photos.find((p) => p.isHero);
    if (!hero) return []; // no photo to show: left out rather than broken
    return [
      {
        id: row.id,
        hero,
        photos,
        name: text(row.name),
        category: (row.category as Category | null) ?? undefined,
        brand: text(row.brand),
        colour: text(row.colour),
        colourHex: text(row.colour_hex),
        material: text(row.material),
        acquired: row.acquired_year
          ? { year: row.acquired_year, month: row.acquired_month ?? undefined }
          : undefined,
        size: text(row.size_label),
        measurements: readMeasurements(row.measurements),
        status: row.is_archived ? "archived" : "in_closet",
        sortPosition: row.sort_position ?? undefined,
        listing:
          row.for_sale && row.asking_price !== null && row.condition
            ? { askingPrice: row.asking_price, condition: row.condition as Condition, note: text(row.sale_note) }
            : undefined,
      },
    ];
  });
  // Archived pieces after the ones still in the closet, as in your own closet.
  items.sort((a, b) => Number(a.status === "archived") - Number(b.status === "archived"));

  const folders = [...folderRows].sort(byMyOrder).map(
    (row): Folder => ({
      id: row.id,
      name: row.name,
      parentId: row.parent_id ?? undefined,
      coverItemId: row.cover_item_id ?? undefined,
      coverSrc: row.cover_path ? urlByPath.get(row.cover_path) : undefined,
      itemIds: [...(row.items as FolderItemJson[])].sort(byMyOrder).map((link) => link.item_id),
      arranged: (row.items as FolderItemJson[]).some((link) => link.position !== null),
    }),
  );

  return {
    username: profile.username,
    closetName: text(profile.closet_name),
    forSaleOnly: profile.for_sale_only,
    saleContact: text(profile.sale_contact),
    items,
    folders,
  };
});

// Blank text counts as empty.
function text(value: string | null): string | undefined {
  return value?.trim() ? value : undefined;
}

// My order, as in lib/folders.ts: no place yet first (newest first), then by place.
function byMyOrder(
  a: { position: number | null; created_at: string },
  b: { position: number | null; created_at: string },
): number {
  if (a.position === null || b.position === null) {
    return a.position === b.position ? b.created_at.localeCompare(a.created_at) : a.position === null ? -1 : 1;
  }
  return a.position - b.position;
}
