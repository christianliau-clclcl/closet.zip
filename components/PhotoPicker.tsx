"use client";

import { useEffect, useId, useRef, useState } from "react";
import PasteButton from "@/components/PasteButton";
import { usePasteImage } from "@/lib/clipboard";

type PhotoPickerProps = {
  onChange: (file: File) => void;
};

// The square photo chooser on the Add page. Tap to choose (phones offer the
// camera, photo library or files); on desktop, a file can also be dropped on
// it or pasted (⌘V); PASTE takes a copied image (e.g. iPhone's Copy Subject). Once chosen, the garment floats in the square as it will in the grid.
export default function PhotoPicker({ onChange }: PhotoPickerProps) {
  const inputId = useId();
  const hintId = `${inputId}-hint`;
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const urlRef = useRef<string | null>(null);

  // ⌘V anywhere on the Add page pastes a copied image as the photo.
  usePasteImage(pick);

  // Free the preview's memory when leaving the page.
  useEffect(() => () => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
  }, []);

  function pick(chosen: File | undefined) {
    if (!chosen) return;
    // Swap the preview for the new file, freeing the previous one.
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = URL.createObjectURL(chosen);
    setPreviewUrl(urlRef.current);
    onChange(chosen);
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
          <PasteButton onImage={pick} />
          {previewUrl && (
            <label htmlFor={inputId} className="cursor-pointer text-label uppercase underline underline-offset-4">
              Change photo
            </label>
          )}
        </span>
      </div>
    </div>
  );
}
