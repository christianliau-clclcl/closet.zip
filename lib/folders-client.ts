import { createClient } from "@/lib/supabase/client";

// Changing folders from the browser. Row Level Security and the database's
// checks (PRODUCT.md Milestone 12) make sure only your own folders change.

// Returns the new folder's ID.
export async function createFolder(name: string, parentId: string | undefined): Promise<string> {
  const { data, error } = await createClient()
    .from("folders")
    .insert({ name: name.trim(), parent_id: parentId ?? null })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export async function renameFolder(id: string, name: string): Promise<void> {
  const { error } = await createClient().from("folders").update({ name: name.trim() }).eq("id", id);
  if (error) throw error;
}

// The database also deletes the folders inside it and every link to pieces;
// the pieces themselves are never touched.
export async function deleteFolder(id: string): Promise<void> {
  const { error } = await createClient().from("folders").delete().eq("id", id);
  if (error) throw error;
}

export async function addToFolder(folderId: string, itemId: string): Promise<void> {
  const { error } = await createClient().from("folder_items").insert({ folder_id: folderId, item_id: itemId });
  if (error) throw error;
}

// Only the link goes; the piece stays in the closet and its other folders.
export async function removeFromFolder(folderId: string, itemId: string): Promise<void> {
  const { error } = await createClient()
    .from("folder_items")
    .delete()
    .eq("folder_id", folderId)
    .eq("item_id", itemId);
  if (error) throw error;
}
