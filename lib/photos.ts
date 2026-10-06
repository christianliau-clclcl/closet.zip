// Saving and removing item photos from the browser. Used by the Add page
// (the hero) and the edit page (detail photos).
// Each photo is two files in the owner's private folder,
// <user id>/<item id>/<name>.<ext> and <name>-thumb.<ext>, plus one
// item_photos row recording where they are.

import { FULL_SIZE, THUMB_SIZE, loadImage, resizeImage, type ResizedImage } from "@/lib/image";
import type { createClient } from "@/lib/supabase/client";

type Supabase = ReturnType<typeof createClient>;

export const BUCKET = "item-photos";
export const MAX_PHOTOS = 8; // per piece, to keep storage in check

export class UnreadableImage extends Error {}

export type PreparedPhoto = { full: ResizedImage; thumb: ResizedImage };

// Resizes a file into both sizes. Throws UnreadableImage if it isn't an
// image the browser can open, before anything is uploaded.
export async function preparePhoto(file: File): Promise<PreparedPhoto> {
  try {
    const image = await loadImage(file);
    const [full, thumb] = await Promise.all([resizeImage(image, FULL_SIZE), resizeImage(image, THUMB_SIZE)]);
    return { full, thumb };
  } catch {
    throw new UnreadableImage();
  }
}

type AddPhotoOptions = {
  userId: string;
  itemId: string;
  photo: PreparedPhoto;
  isHero: boolean;
  position: number;
};

// Uploads both sizes and records the photo. If the record can't be saved,
// the uploaded files are removed again.
export async function addPhoto(supabase: Supabase, { userId, itemId, photo, isHero, position }: AddPhotoOptions) {
  // Unique even when several photos are added at the same moment.
  const name = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  const fullPath = `${userId}/${itemId}/${name}.${photo.full.extension}`;
  const thumbPath = `${userId}/${itemId}/${name}-thumb.${photo.thumb.extension}`;
  const storage = supabase.storage.from(BUCKET);

  try {
    for (const [path, image] of [
      [fullPath, photo.full],
      [thumbPath, photo.thumb],
    ] as const) {
      const { error } = await storage.upload(path, image.blob, { contentType: image.blob.type });
      if (error) throw error;
    }
    const { error } = await supabase.from("item_photos").insert({
      item_id: itemId,
      storage_path: fullPath,
      thumb_path: thumbPath,
      is_hero: isHero,
      position,
    });
    if (error) throw error;
  } catch (cause) {
    await storage.remove([fullPath, thumbPath]);
    throw cause;
  }
}

// Removes one photo: its record, then its files. If it was the hero, the
// next photo in order becomes the hero, so a piece always has one.
// (The edit page never offers to remove a piece's last photo.)
export async function removePhoto(supabase: Supabase, photoId: string) {
  const { data: photo, error } = await supabase
    .from("item_photos")
    .select("item_id, storage_path, thumb_path, is_hero")
    .eq("id", photoId)
    .single();
  if (error) throw error;

  const { error: deleteError } = await supabase.from("item_photos").delete().eq("id", photoId);
  if (deleteError) throw deleteError;

  if (photo.is_hero) {
    const { data: next } = await supabase
      .from("item_photos")
      .select("id")
      .eq("item_id", photo.item_id)
      .order("position")
      .limit(1)
      .maybeSingle();
    if (next) await supabase.from("item_photos").update({ is_hero: true }).eq("id", next.id);
  }

  const paths = [photo.storage_path, photo.thumb_path].filter((p): p is string => Boolean(p));
  await supabase.storage.from(BUCKET).remove(paths);
}

type ReplacePhotoOptions = {
  userId: string;
  itemId: string;
  photoId: string;
  photo: PreparedPhoto;
};

// Swaps a saved photo's picture for a new one (turned, or cut out; 18b),
// keeping its place, cover status and record. The new files are uploaded
// first and the record pointed at them; only then are the old files deleted,
// so a failure part-way leaves the photo as it was.
export async function replacePhoto(supabase: Supabase, { userId, itemId, photoId, photo }: ReplacePhotoOptions) {
  const { data: old, error: readError } = await supabase
    .from("item_photos")
    .select("storage_path, thumb_path")
    .eq("id", photoId)
    .single();
  if (readError) throw readError;

  const name = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  const fullPath = `${userId}/${itemId}/${name}.${photo.full.extension}`;
  const thumbPath = `${userId}/${itemId}/${name}-thumb.${photo.thumb.extension}`;
  const storage = supabase.storage.from(BUCKET);

  try {
    for (const [path, image] of [
      [fullPath, photo.full],
      [thumbPath, photo.thumb],
    ] as const) {
      const { error } = await storage.upload(path, image.blob, { contentType: image.blob.type });
      if (error) throw error;
    }
    const { error } = await supabase
      .from("item_photos")
      .update({ storage_path: fullPath, thumb_path: thumbPath })
      .eq("id", photoId);
    if (error) throw error;
  } catch (cause) {
    await storage.remove([fullPath, thumbPath]);
    throw cause;
  }

  const paths = [old.storage_path, old.thumb_path].filter((p): p is string => Boolean(p));
  await storage.remove(paths);
}
