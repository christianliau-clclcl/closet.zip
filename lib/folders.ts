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
    .select("id, name, parent_id, cover_item_id, position, created_at, folder_items(item_id, position, created_at)");
  if (error) throw error;

  return [...data].sort(byMyOrder).map((row) => ({
    id: row.id,
    name: row.name,
    parentId: row.parent_id ?? undefined,
    coverItemId: row.cover_item_id ?? undefined,
    itemIds: [...row.folder_items].sort(byMyOrder).map((link) => link.item_id),
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
