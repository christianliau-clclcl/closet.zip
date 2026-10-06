"use client";

import { MotionConfig, Reorder } from "motion/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useId, useRef, useState } from "react";
import PasteButton from "@/components/PasteButton";
import { usePasteImage } from "@/lib/clipboard";
import { removePhotoBackground } from "@/lib/background-removal";
import { photoFile, rotateImage } from "@/lib/image";
import { MAX_PHOTOS, UnreadableImage, addPhoto, preparePhoto, removePhoto, replacePhoto } from "@/lib/photos";
import { createClient } from "@/lib/supabase/client";
import type { Photo } from "@/lib/types";

type PhotoManagerProps = {
  itemId: string;
  photos: Photo[]; // display order, hero first
};

const smallAction = "cursor-pointer text-label uppercase disabled:cursor-wait disabled:text-pebble";

// The Photos section of the edit page. The first photo is the hero (the
// cover in the grid). Reorder by dragging (motion's Reorder) or with the ← →
// buttons; Make hero moves a photo to the front; ↺ ↻ turn a photo a quarter
// and CUT OUT removes its background on the device (18b), with UNDO right
// after. Every change saves straight away, then the page re-reads the item
// so everything stays in step.
export default function PhotoManager({ itemId, photos }: PhotoManagerProps) {
  const router = useRouter();
  const inputId = useId();
  const savedIds = photos.flatMap((p) => (p.id ? [p.id] : []));
  const byId = new Map(photos.map((p) => [p.id, p]));
  const [order, setOrder] = useState(savedIds); // photo IDs, as currently arranged
  const latestOrder = useRef(order); // what was last dropped, for saving on release
  const [busy, setBusy] = useState<string | null>(null); // what's happening, e.g. "Adding…"
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // The photo as it was before the last cut-out, for UNDO (until the next change).
  const [undoable, setUndoable] = useState<{ photoId: string; original: File } | null>(null);
  const roomLeft = MAX_PHOTOS - photos.length;

  // Turns, cuts out or restores one saved photo: loads it, makes the new
  // picture, then swaps it in (replacePhoto keeps its place and cover).
  async function change(photoId: string, make: (file: File) => Promise<File>, label: string, keepForUndo = false) {
    const photo = byId.get(photoId);
    if (!photo || busy) return;
    setError(null);
    setBusy(label);
    try {
      const supabase = createClient();
      const { data: auth } = await supabase.auth.getClaims();
      const userId = auth?.claims?.sub;
      if (!userId) throw new Error("Not logged in");
      const before = await photoFile(photo.src);
      const after = await make(before);
      await replacePhoto(supabase, { userId, itemId, photoId, photo: await preparePhoto(after) });
      setUndoable(keepForUndo ? { photoId, original: before } : null);
    } catch {
      setError("Couldn't change the photo. Check your connection and try again.");
    }
    setBusy(null);
    router.refresh();
  }

  const turn = (photoId: string, direction: 1 | -1) =>
    change(photoId, (file) => rotateImage(file, direction), "Turning…");
  const cutOut = (photoId: string) =>
    change(
      photoId,
      (file) =>
        removePhotoBackground(file, (progress) =>
          setBusy(progress.stage === "downloading" ? `Downloading… ${progress.percent}%` : "Cutting out…"),
        ),
      "Cutting out…",
      true,
    );
  const undoCutOut = () => undoable && change(undoable.photoId, async () => undoable.original, "Undoing…");

  function arrange(ids: string[]) {
    latestOrder.current = ids;
    setOrder(ids);
  }

  // Saves the order in one database call (all-or-nothing). On failure the
  // tiles go back to the last saved order.
  async function saveOrder(ids: string[]) {
    if (ids.join() === savedIds.join()) return;
    setError(null);
    setBusy("Saving order…");
    const { error } = await createClient().rpc("reorder_item_photos", { p_item_id: itemId, p_photo_ids: ids });
    if (error) {
      setError("Couldn't save the new order. Check your connection and try again.");
      arrange(savedIds);
    }
    setBusy(null);
    router.refresh();
  }

  function move(id: string, to: number) {
    const ids = order.filter((x) => x !== id);
    ids.splice(to, 0, id);
    arrange(ids);
    saveOrder(ids);
  }

  async function add(files: FileList | File[] | null) {
    const chosen = [...(files ?? [])].filter((f) => f.type.startsWith("image/")).slice(0, roomLeft);
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

  // ⌘V anywhere on the Edit page pastes a copied image as a new photo.
  usePasteImage((file) => add([file]), roomLeft > 0 && !busy);

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
      <p className="mt-1 text-stone">
        The first photo is the cover. Drag to reorder. Changes save straight away.
      </p>
      <p aria-live="polite" className="mt-1 text-label uppercase">
        {busy}
      </p>

      {/* reducedMotion="user": with Reduce motion on, the other photos jump to
          their new places instead of gliding while you drag. */}
      <MotionConfig reducedMotion="user">
        <Reorder.Group
          axis="xy"
          values={order}
          onReorder={arrange}
          className="mt-4 grid grid-cols-3 gap-x-2 gap-y-4"
        >
          {order.map((id, index) => {
            const photo = byId.get(id);
            if (!photo) return null;
            const isHero = index === 0;
            return (
              <Reorder.Item
                key={id}
                value={id}
                dragListener={!busy}
                onDragEnd={() => saveOrder(latestOrder.current)}
                className="relative cursor-grab bg-canvas active:cursor-grabbing"
              >
                <div className="relative aspect-square border border-rule">
                  <Image
                    src={photo.thumbSrc ?? photo.src}
                    alt={isHero ? `Photo ${index + 1}, the cover` : `Photo ${index + 1}`}
                    fill
                    sizes="128px"
                    unoptimized={photo.unoptimized}
                    draggable={false}
                    className="pointer-events-none object-contain p-2 select-none"
                  />
                </div>

                {confirmingId === id ? (
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-label uppercase">
                    <span>Remove?</span>
                    <button type="button" onClick={() => remove(id)} disabled={Boolean(busy)} className={`${smallAction} underline underline-offset-4`}>
                      Yes
                    </button>
                    <button type="button" onClick={() => setConfirmingId(null)} className={`${smallAction} text-stone`}>
                      Keep
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="mt-2 text-label uppercase">
                      {isHero ? (
                        <span>Cover</span>
                      ) : (
                        <button type="button" onClick={() => move(id, 0)} disabled={Boolean(busy)} className={`${smallAction} underline-offset-4 hover:underline`}>
                          Make cover
                        </button>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-stone">
                      <button
                        type="button"
                        onClick={() => move(id, index - 1)}
                        disabled={index === 0 || Boolean(busy)}
                        aria-label="Move earlier"
                        className={`${smallAction} disabled:invisible`}
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        onClick={() => move(id, index + 1)}
                        disabled={index === order.length - 1 || Boolean(busy)}
                        aria-label="Move later"
                        className={`${smallAction} disabled:invisible`}
                      >
                        →
                      </button>
                      {/* A piece always keeps at least one photo. */}
                      {photos.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setConfirmingId(id)}
                          disabled={Boolean(busy)}
                          className={`${smallAction} ml-auto underline-offset-4 hover:underline`}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-stone">
                      <button
                        type="button"
                        onClick={() => turn(id, -1)}
                        disabled={Boolean(busy)}
                        aria-label={`Turn photo ${index + 1} left`}
                        className={`${smallAction} -m-2 p-2`}
                      >
                        ↺
                      </button>
                      <button
                        type="button"
                        onClick={() => turn(id, 1)}
                        disabled={Boolean(busy)}
                        aria-label={`Turn photo ${index + 1} right`}
                        className={`${smallAction} -m-2 p-2`}
                      >
                        ↻
                      </button>
                      {undoable?.photoId === id ? (
                        <button
                          type="button"
                          onClick={undoCutOut}
                          disabled={Boolean(busy)}
                          aria-label={`Undo background removal on photo ${index + 1}`}
                          className={`${smallAction} ml-auto underline-offset-4 hover:underline`}
                        >
                          Undo
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => cutOut(id)}
                          disabled={Boolean(busy)}
                          aria-label={`Remove the background from photo ${index + 1}`}
                          className={`${smallAction} ml-auto underline-offset-4 hover:underline`}
                        >
                          Cut out
                        </button>
                      )}
                    </div>
                  </>
                )}
              </Reorder.Item>
            );
          })}
        </Reorder.Group>
      </MotionConfig>

      {roomLeft > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-2">
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
            // Desktop: photos can also be dropped on the tile.
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              add(event.dataTransfer.files);
            }}
            className="flex aspect-square cursor-pointer items-center justify-center border border-rule p-2 text-center text-label uppercase peer-focus-visible:outline-1 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink peer-disabled:cursor-wait"
          >
            {busy ?? "Add photo"}
          </label>
          <div className="col-span-2 flex flex-col justify-end gap-2">
            <p className="hidden text-stone md:block">Or drop photos on the tile, or paste (⌘V).</p>
            <div>
              <PasteButton onImage={(file) => add([file])} disabled={Boolean(busy)} />
            </div>
          </div>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-4">
          {error}
        </p>
      )}
    </section>
  );
}
