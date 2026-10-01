"use client";

import { useEffect, useId, useRef, useState } from "react";

type PhotoPickerProps = {
  onChange: (file: File) => void;
};

// The square photo chooser on the Add page. Tap to choose (phones offer the
// camera, photo library or files); on desktop, a file can also be dropped on
// it. Once chosen, the garment floats in the square as it will in the grid.
export default function PhotoPicker({ onChange }: PhotoPickerProps) {
  const inputId = useId();
  const hintId = `${inputId}-hint`;
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const urlRef = useRef<string | null>(null);

  // Free the preview's memory when leaving the page.
  useEffect(() => () => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
  }, []);

  function pick(files: FileList | null) {
    const chosen = files?.[0];
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
        onChange={(event) => pick(event.target.files)}
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
          pick(event.dataTransfer.files);
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
          <span className="text-label uppercase">Choose photo</span>
        )}
      </label>

      <div className="mt-2 flex items-baseline justify-between gap-4">
        <p id={hintId} className="text-stone">
          A PNG with the background removed works best.
        </p>
        {previewUrl && (
          <label htmlFor={inputId} className="shrink-0 cursor-pointer text-label uppercase underline underline-offset-4">
            Change photo
          </label>
        )}
      </div>
    </div>
  );
}
