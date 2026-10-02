import { createClient } from "@/lib/supabase/server";
import type { Folder } from "@/lib/types";

// The logged-in person's folders, with the pieces in each. Row Level Security
// already limits the query to their own rows. Folders and pieces in a folder
// come in "My order": arranged ones by their place, with new ones (no place
// yet) first, newest first (PRODUCT.md, Milestone 12 decisions).
export async function getMyFolders(): Promise<Folder[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("folders")
    .select(
      "id, name, parent_id, cover_item_id, cover_path, position, is_hidden, created_at, folder_items(item_id, position, created_at)",
    );
  if (error) throw error;

  // Uploaded cover images are private: one request for all their signed links.
  const coverPaths = data.flatMap((row) => (row.cover_path ? [row.cover_path] : []));
  const coverSrc = new Map<string, string>();
  if (coverPaths.length > 0) {
    const { data: signed } = await supabase.storage.from("item-photos").createSignedUrls(coverPaths, 60 * 60);
    for (const s of signed ?? []) if (s.path && s.signedUrl) coverSrc.set(s.path, s.signedUrl);
  }

  return [...data].sort(byMyOrder).map((row) => ({
    id: row.id,
    name: row.name,
    parentId: row.parent_id ?? undefined,
    coverItemId: row.cover_item_id ?? undefined,
    coverPath: row.cover_path ?? undefined,
    coverSrc: row.cover_path ? coverSrc.get(row.cover_path) : undefined,
    itemIds: [...row.folder_items].sort(byMyOrder).map((link) => link.item_id),
    arranged: row.folder_items.some((link) => link.position !== null),
    hidden: row.is_hidden || undefined,
  }));
}

// No place yet comes first (newest first), then by place.
function byMyOrder(
  a: { position: number | null; created_at: string },
  b: { position: number | null; created_at: string },
): number {
  if (a.position === null || b.position === null) {
    return a.position === b.position ? b.created_at.localeCompare(a.created_at) : a.position === null ? -1 : 1;
  }
  return a.position - b.position;
}
