"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import ItemDetailsFields from "@/components/ItemDetailsFields";
import PhotoPicker from "@/components/PhotoPicker";
import { FULL_SIZE, THUMB_SIZE, loadImage, resizeImage } from "@/lib/image";
import { draftToRow, emptyDraft, type DetailsRow, type ItemDraft } from "@/lib/item-draft";
import { createClient } from "@/lib/supabase/client";

const BUCKET = "item-photos";

// The Add page's form: the photo, then every optional detail. Saving: check
// the details, resize the photo into two sizes in the browser, create the item, upload both files to the owner's private folder,
// then record the photo. If any step fails, whatever was already created is
// removed again, so there's never a half-saved item.
export default function AddItemForm({ brandSuggestions }: { brandSuggestions: string[] }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [draft, setDraft] = useState<ItemDraft>(emptyDraft);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function choose(chosen: File) {
    setFile(chosen);
    setError(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) return;

    // Check the details first: instant, and nothing is uploaded if they're off.
    const checked = draftToRow(draft);
    if ("error" in checked) {
      setError(checked.error);
      return;
    }

    setBusy(true);
    setError(null);

    try {
      await saveItem(file, checked.row);
      router.push("/");
      router.refresh();
    } catch (cause) {
      setError(
        cause instanceof UnreadableImage
          ? "That file couldn't be opened as an image. Try a PNG, JPEG or WebP."
          : "Couldn't save. Check your connection and try again.",
      );
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <PhotoPicker onChange={choose} />
      <ItemDetailsFields draft={draft} onChange={setDraft} brandSuggestions={brandSuggestions} />
      <div>
        {error && (
          <p role="alert" className="mb-4">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={!file || busy}
          className="w-full cursor-pointer bg-ink px-5 py-3 font-medium text-cell disabled:cursor-not-allowed"
        >
          {busy ? "Saving…" : file ? "Save" : "Choose a photo first"}
        </button>
      </div>
    </form>
  );
}

class UnreadableImage extends Error {}

async function saveItem(file: File, details: DetailsRow) {
  // 1. Resize first: if the file isn't a readable image, nothing is created.
  let full, thumb;
  try {
    const image = await loadImage(file);
    [full, thumb] = await Promise.all([resizeImage(image, FULL_SIZE), resizeImage(image, THUMB_SIZE)]);
  } catch {
    throw new UnreadableImage();
  }

  const supabase = createClient();
  const { data: auth } = await supabase.auth.getClaims();
  const userId = auth?.claims?.sub;
  if (!userId) throw new Error("Not logged in");

  // 2. Create the item with its details, to get its ID.
  const { data: item, error: itemError } = await supabase.from("items").insert(details).select("id").single();
  if (itemError) throw itemError;

  // Files go in the owner's folder: <user id>/<item id>/<photo name>.<ext>
  const photoName = `${Date.now().toString(36)}`;
  const fullPath = `${userId}/${item.id}/${photoName}.${full.extension}`;
  const thumbPath = `${userId}/${item.id}/${photoName}-thumb.${thumb.extension}`;
  const storage = supabase.storage.from(BUCKET);

  try {
    // 3. Upload both sizes.
    for (const [path, image] of [
      [fullPath, full],
      [thumbPath, thumb],
    ] as const) {
      const { error } = await storage.upload(path, image.blob, { contentType: image.blob.type });
      if (error) throw error;
    }

    // 4. Record the photo as the item's hero.
    const { error: photoError } = await supabase.from("item_photos").insert({
      item_id: item.id,
      storage_path: fullPath,
      thumb_path: thumbPath,
      is_hero: true,
      position: 0,
    });
    if (photoError) throw photoError;
  } catch (cause) {
    // Undo: remove any uploaded files, then the item itself.
    await storage.remove([fullPath, thumbPath]);
    await supabase.from("items").delete().eq("id", item.id);
    throw cause;
  }
}
