"use client";

import { useEffect, useId, useRef, useState } from "react";
import PasteButton from "@/components/PasteButton";
import { removePhotoBackground, type RemovalProgress } from "@/lib/background-removal";
import { usePasteImage } from "@/lib/clipboard";
import { rotateImage } from "@/lib/image";

type PhotoPickerProps = {
  onChange: (file: File) => void;
};

// The square photo chooser on the Add page. Tap to choose (phones offer the
// camera, photo library or files); on desktop, a file can also be dropped on
// it or pasted (⌘V); PASTE takes a copied image (e.g. iPhone's Copy Subject).
// Once chosen, the garment floats in the square as it will in the grid, and
// ↺ ↻ turn it a quarter, REMOVE BACKGROUND cuts it out on the device
// (lib/background-removal.ts) and UNDO brings the original back.
export default function PhotoPicker({ onChange }: PhotoPickerProps) {
  const inputId = useId();
  const hintId = `${inputId}-hint`;
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const urlRef = useRef<string | null>(null);
  const [current, setCurrent] = useState<File | null>(null);
  // The photo as chosen, kept while a cut-out stands in for it (for UNDO).
  const [original, setOriginal] = useState<File | null>(null);
  const [removal, setRemoval] = useState<RemovalProgress | null>(null);
  const [removalError, setRemovalError] = useState<string | null>(null);

  // ⌘V anywhere on the Add page pastes a copied image as the photo.
  usePasteImage(pick);

  // Free the preview's memory when leaving the page.
  useEffect(() => () => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
  }, []);

  // Shows a photo and hands it to the form.
  function show(file: File) {
    // Swap the preview for the new file, freeing the previous one.
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = URL.createObjectURL(file);
    setPreviewUrl(urlRef.current);
    setCurrent(file);
    onChange(file);
  }

  // A newly chosen photo starts over: no cut-out, nothing to undo.
  function pick(chosen: File | undefined) {
    if (!chosen || removal) return;
    setOriginal(null);
    setRemovalError(null);
    show(chosen);
  }

  async function removeBackground() {
    if (!current) return;
    const before = current;
    setRemovalError(null);
    setRemoval({ stage: "removing" });
    try {
      const cutOut = await removePhotoBackground(before, setRemoval);
      setOriginal(before);
      show(cutOut);
    } catch {
      setRemovalError("Couldn't remove the background. Try again, or choose a photo with it already removed.");
    }
    setRemoval(null);
  }

  // ↺ ↻: a quarter turn. With a cut-out showing, the original turns too, so
  // UNDO brings it back the same way up.
  async function turn(direction: 1 | -1) {
    if (!current || removal) return;
    setRemovalError(null);
    try {
      const [turned, turnedOriginal] = await Promise.all([
        rotateImage(current, direction),
        original ? rotateImage(original, direction) : Promise.resolve(null),
      ]);
      show(turned);
      if (turnedOriginal) setOriginal(turnedOriginal);
    } catch {
      setRemovalError("Couldn't turn the photo. Try again.");
    }
  }

  function undo() {
    if (!original) return;
    show(original);
    setOriginal(null);
  }

  return (
    <div>
      {/* The real file input is visually hidden but still focusable, so
          keyboard users can Tab to it; the square is its label. */}
      <input
        id={inputId}
        type="file"
        accept="image/*"
        aria-describedby={hintId}
        className="peer sr-only"
        onChange={(event) => pick(event.target.files?.[0])}
      />
      <label
        htmlFor={inputId}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          pick(event.dataTransfer.files[0]);
        }}
        className={`relative flex aspect-square w-full cursor-pointer items-center justify-center border peer-focus-visible:outline-1 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink ${
          dragging ? "border-ink" : "border-rule"
        }`}
      >
        {previewUrl ? (
          // A plain <img>: this is a local preview of a file on the device,
          // not something Next.js can or should resize.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="Chosen photo" className="absolute inset-0 h-full w-full object-contain p-12" />
        ) : (
          <span className="flex flex-col items-center gap-1 text-center">
            <span className="text-label uppercase">Choose photo</span>
            {/* Desktop only: phones can't drop, and use PASTE below instead of ⌘V. */}
            <span className="hidden text-stone md:block">or drop it here, or paste (⌘V)</span>
          </span>
        )}
      </label>

      <div className="mt-2 flex items-baseline justify-between gap-4">
        <p id={hintId} className="text-stone">
          A PNG with the background removed works best.
        </p>
        <span className="flex shrink-0 items-baseline gap-4">
          <PasteButton onImage={pick} disabled={Boolean(removal)} />
          {previewUrl && (
            <label htmlFor={inputId} className="cursor-pointer text-label uppercase underline underline-offset-4">
              Change photo
            </label>
          )}
        </span>
      </div>
      {previewUrl && (
        <div className="mt-4 flex flex-wrap items-baseline gap-x-6 gap-y-2">
          <span className="flex gap-4">
            <button
              type="button"
              onClick={() => turn(-1)}
              disabled={Boolean(removal)}
              aria-label="Turn photo left"
              className="-m-2 cursor-pointer p-2 text-label disabled:cursor-wait"
            >
              ↺
            </button>
            <button
              type="button"
              onClick={() => turn(1)}
              disabled={Boolean(removal)}
              aria-label="Turn photo right"
              className="-m-2 cursor-pointer p-2 text-label disabled:cursor-wait"
            >
              ↻
            </button>
          </span>
          {original ? (
            <button type="button" onClick={undo} className="cursor-pointer text-label uppercase underline underline-offset-4">
              Undo background removal
            </button>
          ) : (
            <button
              type="button"
              onClick={removeBackground}
              disabled={Boolean(removal)}
              aria-live="polite"
              className="cursor-pointer text-label uppercase underline underline-offset-4 disabled:cursor-wait disabled:no-underline"
            >
              {!removal
                ? "Remove background"
                : removal.stage === "downloading"
                  ? `Downloading… ${removal.percent}%`
                  : "Removing background…"}
            </button>
          )}
          {/* The first time only: the model comes down once, then stays. */}
          {!original && !removal && <span className="text-stone">Done on your device. First use downloads about 40 MB.</span>}
        </div>
      )}
      {removalError && (
        <p role="alert" className="mt-2">
          {removalError}
        </p>
      )}
    </div>
  );
}
