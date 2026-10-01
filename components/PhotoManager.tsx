"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { MAX_PHOTOS, UnreadableImage, addPhoto, preparePhoto, removePhoto } from "@/lib/photos";
import { createClient } from "@/lib/supabase/client";
import type { Photo } from "@/lib/types";

type PhotoManagerProps = {
  itemId: string;
  photos: Photo[]; // display order, hero first
};

// The Photos section of the edit page: every photo of a piece, the hero
// first, plus an Add tile. Changes save straight away (they're uploads), then
// the page re-reads the item so everything stays in step.
export default function PhotoManager({ itemId, photos }: PhotoManagerProps) {
  const router = useRouter();
  const inputId = useId();
  const [busy, setBusy] = useState<string | null>(null); // what's happening, e.g. "Adding…"
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const roomLeft = MAX_PHOTOS - photos.length;

  async function add(files: FileList | null) {
    const chosen = [...(files ?? [])].slice(0, roomLeft);
    if (chosen.length === 0) return;
    setError(null);
    setBusy(chosen.length > 1 ? `Adding ${chosen.length} photos…` : "Adding…");

    const supabase = createClient();
    const { data: auth } = await supabase.auth.getClaims();
    const userId = auth?.claims?.sub;
    let position = Math.max(-1, ...photos.map((p) => p.position ?? 0)) + 1;
    let unreadable = 0;
    let failed = 0;

    // One at a time, so a big batch doesn't overwhelm a phone's connection.
    for (const file of chosen) {
      try {
        if (!userId) throw new Error("Not logged in");
        const photo = await preparePhoto(file);
        await addPhoto(supabase, { userId, itemId, photo, isHero: false, position });
        position += 1;
      } catch (cause) {
        if (cause instanceof UnreadableImage) unreadable += 1;
        else failed += 1;
      }
    }

    if (failed > 0) setError("Some photos couldn't be saved. Check your connection and try again.");
    else if (unreadable > 0) setError("Some files couldn't be opened as images. Try a PNG, JPEG or WebP.");
    setBusy(null);
    router.refresh();
  }

  async function remove(photoId: string) {
    setError(null);
    setBusy("Removing…");
    try {
      await removePhoto(createClient(), photoId);
    } catch {
      setError("Couldn't remove the photo. Check your connection and try again.");
    }
    setConfirmingId(null);
    setBusy(null);
    router.refresh();
  }

  return (
    <section aria-label="Photos">
      <div className="flex items-baseline justify-between">
        <h2 className="text-label uppercase">Photos</h2>
        <p className="text-stone">
          {photos.length} of {MAX_PHOTOS}
        </p>
      </div>
      <p className="mt-1 text-stone">Photo changes save straight away.</p>

      <ul className="mt-4 grid grid-cols-3 gap-2">
        {photos.map((photo) => (
          <li key={photo.id}>
            <div className="relative aspect-square border border-rule">
              <Image
                src={photo.thumbSrc ?? photo.src}
                alt={photo.isHero ? "Hero photo" : "Detail photo"}
                fill
                sizes="128px"
                unoptimized={photo.unoptimized}
                className="object-contain p-2"
              />
            </div>
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-label uppercase">
              {confirmingId === photo.id ? (
                <>
                  <span>Remove?</span>
                  <button
                    type="button"
                    onClick={() => photo.id && remove(photo.id)}
                    disabled={Boolean(busy)}
                    className="cursor-pointer uppercase underline underline-offset-4 disabled:cursor-wait"
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingId(null)}
                    className="cursor-pointer text-stone uppercase"
                  >
                    Keep
                  </button>
                </>
              ) : (
                <>
                  {photo.isHero && <span>Hero</span>}
                  {/* A piece always keeps at least one photo. */}
                  {photos.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setConfirmingId(photo.id ?? null)}
                      disabled={Boolean(busy)}
                      className="cursor-pointer text-stone uppercase underline-offset-4 hover:underline disabled:cursor-wait"
                    >
                      Remove
                    </button>
                  )}
                </>
              )}
            </div>
          </li>
        ))}

        {roomLeft > 0 && (
          <li>
            {/* The file input is visually hidden but focusable; the tile is its label. */}
            <input
              id={inputId}
              type="file"
              accept="image/*"
              multiple
              disabled={Boolean(busy)}
              className="peer sr-only"
              onChange={(event) => {
                add(event.target.files);
                event.target.value = ""; // so choosing the same file again still works
              }}
            />
            <label
              htmlFor={inputId}
              className="flex aspect-square cursor-pointer items-center justify-center border border-rule p-2 text-center text-label uppercase peer-focus-visible:outline-1 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink peer-disabled:cursor-wait"
            >
              {busy ?? "Add photo"}
            </label>
          </li>
        )}
      </ul>

      {error && (
        <p role="alert" className="mt-4">
          {error}
        </p>
      )}
    </section>
  );
}
