import { THUMB_SIZE, loadImage, resizeImage } from "@/lib/image";
import { BUCKET, UnreadableImage } from "@/lib/photos";
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

// The database also deletes the folders inside it and every link to pieces;
// the pieces themselves are never touched. coverPaths: the uploaded cover
// images of this folder and those inside it, removed from storage too.
export async function deleteFolder(id: string, coverPaths: string[] = []): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("folders").delete().eq("id", id);
  if (error) throw error;
  // If this fails the folder is still gone; at worst a few unseen files stay.
  if (coverPaths.length > 0) await supabase.storage.from(BUCKET).remove(coverPaths);
}

// The cover chosen in the folder modal (PRODUCT.md Milestone 12e).
export type CoverChoice =
  | { kind: "box" }
  | { kind: "piece"; itemId: string }
  | { kind: "image"; file: File } // a newly chosen image
  | { kind: "current-image" }; // keep the image it already has

type SaveFolderOptions = {
  id?: string; // none: create a new folder
  name: string;
  parentId?: string; // the folder it goes in; none for the top level
  cover: CoverChoice;
  currentCoverPath?: string; // the image it has now, if any
  hidden: boolean; // left off your public page (Milestone 15b)
};

// Creates or updates a folder with its name and cover. A new image is resized
// in the browser (transparency kept) and stored privately at
// <user id>/folders/<folder id>.<ext>; an image no longer used is deleted.
// Returns the folder's ID. Throws UnreadableImage for a file that isn't an image.
export async function saveFolder({ id, name, parentId, cover, currentCoverPath, hidden }: SaveFolderOptions): Promise<string> {
  const supabase = createClient();
  const storage = supabase.storage.from(BUCKET);

  // Check the image first: nothing is created if it can't be opened.
  let resized: Awaited<ReturnType<typeof resizeImage>> | undefined;
  if (cover.kind === "image") {
    try {
      resized = await resizeImage(await loadImage(cover.file), THUMB_SIZE);
    } catch {
      throw new UnreadableImage();
    }
  }

  const folderId = id ?? (await createFolder(name, parentId));

  let coverPath: string | null = cover.kind === "current-image" ? (currentCoverPath ?? null) : null;
  if (resized) {
    const { data: auth } = await supabase.auth.getClaims();
    const userId = auth?.claims?.sub;
    if (!userId) throw new Error("Not logged in");
    coverPath = `${userId}/folders/${folderId}.${resized.extension}`;
    // upsert: replacing an earlier image with the same name.
    const { error } = await storage.upload(coverPath, resized.blob, { contentType: resized.blob.type, upsert: true });
    if (error) throw error;
  }

  const { error } = await supabase
    .from("folders")
    .update({
      name: name.trim(),
      // Moving (Milestone 12f); the database refuses a folder inside itself.
      parent_id: parentId ?? null,
      cover_item_id: cover.kind === "piece" ? cover.itemId : null,
      cover_path: coverPath,
      is_hidden: hidden,
    })
    .eq("id", folderId);
  if (error) throw error;

  // The old image, if it's no longer the cover (box, a piece, or a new image
  // saved under a different extension).
  if (currentCoverPath && currentCoverPath !== coverPath) await storage.remove([currentCoverPath]);

  return folderId;
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

// ARRANGE (Milestone 12g): save My order in one go, for the whole closet or
// one folder (database functions, so it's all or nothing).
export async function saveClosetOrder(itemIds: string[]): Promise<void> {
  const { error } = await createClient().rpc("arrange_items", { p_item_ids: itemIds });
  if (error) throw error;
}

export async function saveFolderOrder(folderId: string, itemIds: string[]): Promise<void> {
  const { error } = await createClient().rpc("arrange_folder", { p_folder_id: folderId, p_item_ids: itemIds });
  if (error) throw error;
}

// SELECT mode: add several pieces in one request. Pieces already in the
// folder are skipped (the link exists), and they stay in their other folders.
export async function addManyToFolder(folderId: string, itemIds: string[]): Promise<void> {
  const { error } = await createClient()
    .from("folder_items")
    .upsert(
      itemIds.map((itemId) => ({ folder_id: folderId, item_id: itemId })),
      { onConflict: "folder_id,item_id", ignoreDuplicates: true },
    );
  if (error) throw error;
}

// SELECT mode inside a folder: take several pieces out of it (only the links).
export async function removeManyFromFolder(folderId: string, itemIds: string[]): Promise<void> {
  const { error } = await createClient()
    .from("folder_items")
    .delete()
    .eq("folder_id", folderId)
    .in("item_id", itemIds);
  if (error) throw error;
}
