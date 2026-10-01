"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ItemDetailsFields from "@/components/ItemDetailsFields";
import PhotoPicker from "@/components/PhotoPicker";
import {
  convertDraftMeasurements,
  draftToRow,
  emptyDraft,
  type DetailsRow,
  type ItemDraft,
} from "@/lib/item-draft";
import type { Unit } from "@/lib/measurements";
import { detectColour, loadImageFromUrl } from "@/lib/colour";
import { UnreadableImage, addPhoto, preparePhoto } from "@/lib/photos";
import { saveMyUnit } from "@/lib/profile-client";
import { createClient } from "@/lib/supabase/client";

// The Add page's form: the photo, then every optional detail. Saving: check
// the details, resize the photo in the browser, create the item, then upload
// and record the photo (lib/photos.ts). If any step fails, whatever was
// already created is removed again, so there's never a half-saved item.
type AddItemFormProps = {
  brandSuggestions: string[];
  initialUnit: Unit;
};

export default function AddItemForm({ brandSuggestions, initialUnit }: AddItemFormProps) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string>(); // the chosen photo, for colour
  const photoUrlRef = useRef<string | null>(null);
  const [draft, setDraft] = useState<ItemDraft>(emptyDraft);
  const [unit, setUnit] = useState<Unit>(initialUnit);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Switching units converts what's already typed and remembers the choice.
  function changeUnit(next: Unit) {
    setDraft((d) => ({ ...d, measurements: convertDraftMeasurements(d.measurements, unit, next) }));
    setUnit(next);
    saveMyUnit(next);
  }

  // Free the photo's memory when leaving the page.
  useEffect(() => () => {
    if (photoUrlRef.current) URL.revokeObjectURL(photoUrlRef.current);
  }, []);

  // A new photo is a new garment: detect its colour, replacing any earlier one.
  function choose(chosen: File) {
    setFile(chosen);
    setError(null);
    if (photoUrlRef.current) URL.revokeObjectURL(photoUrlRef.current);
    const url = URL.createObjectURL(chosen);
    photoUrlRef.current = url;
    setPhotoUrl(url);
    loadImageFromUrl(url)
      .then(detectColour)
      .catch(() => null) // not a readable image: saving will say so
      .then((hex) => {
        // Only if this is still the chosen photo (a quick second choice wins).
        if (photoUrlRef.current === url) setDraft((d) => ({ ...d, colourHex: hex ?? "" }));
      });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) return;

    // Check the details first: instant, and nothing is uploaded if they're off.
    const checked = draftToRow(draft, unit);
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
      <ItemDetailsFields
        draft={draft}
        onChange={setDraft}
        photoSrc={photoUrl}
        brandSuggestions={brandSuggestions}
        unit={unit}
        onUnitChange={changeUnit}
      />
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

async function saveItem(file: File, details: DetailsRow) {
  // 1. Resize first: if the file isn't a readable image, nothing is created.
  const photo = await preparePhoto(file);

  const supabase = createClient();
  const { data: auth } = await supabase.auth.getClaims();
  const userId = auth?.claims?.sub;
  if (!userId) throw new Error("Not logged in");

  // 2. Create the item with its details, to get its ID.
  const { data: item, error: itemError } = await supabase.from("items").insert(details).select("id").single();
  if (itemError) throw itemError;

  // 3. Upload and record the hero photo. If that fails, remove the item again.
  try {
    await addPhoto(supabase, { userId, itemId: item.id, photo, isHero: true, position: 0 });
  } catch (cause) {
    await supabase.from("items").delete().eq("id", item.id);
    throw cause;
  }
}
