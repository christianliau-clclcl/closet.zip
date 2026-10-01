"use client";

import { useId, useRef, useState } from "react";
import { detectColour, loadImageFromUrl, sampleColour } from "@/lib/colour";
import { containedBox } from "@/lib/image";

type ColourFieldProps = {
  name: string; // the colour in the person's own words: "Indigo"
  hex: string; // the colour itself, "" or "#rrggbb"
  onNameChange: (name: string) => void;
  onHexChange: (hex: string) => void;
  photoSrc?: string; // the cover photo, to pick from (none yet on Add)
};

// The Colour field on Add and Edit (Milestone 11b): a square swatch of the
// detected or picked colour beside the name. PICK FROM PHOTO opens the cover
// photo under the field; tapping the garment picks the colour there, like an
// eyedropper. DETECT AGAIN reads the photo's main colour again.
export default function ColourField({ name, hex, onNameChange, onHexChange, photoSrc }: ColourFieldProps) {
  const inputId = useId();
  const imageRef = useRef<HTMLImageElement>(null);
  const [picking, setPicking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const unreadable = "Couldn't read this photo's colours. Try again later.";

  function pick(event: React.MouseEvent) {
    const image = imageRef.current;
    const picture = image && containedBox(image);
    if (!image || !picture) return;
    // Where the tap landed in the photo's own pixels.
    const x = ((event.clientX - picture.left) / picture.width) * image.naturalWidth;
    const y = ((event.clientY - picture.top) / picture.height) * image.naturalHeight;
    const outside = x < 0 || y < 0 || x > image.naturalWidth || y > image.naturalHeight;
    try {
      const picked = outside ? null : sampleColour(image, x, y);
      if (!picked) {
        setMessage("That's the background. Tap the garment itself.");
        return;
      }
      onHexChange(picked);
      setMessage(null);
      setPicking(false);
    } catch {
      setMessage(unreadable);
    }
  }

  async function detectAgain() {
    if (!photoSrc) return;
    try {
      const detected = detectColour(await loadImageFromUrl(photoSrc));
      if (detected) onHexChange(detected);
      setMessage(detected ? null : "No garment found in this photo.");
    } catch {
      setMessage(unreadable);
    }
  }

  const textButton = "cursor-pointer text-label uppercase underline-offset-4 hover:underline";

  return (
    <div>
      <label htmlFor={inputId} className="text-label uppercase">
        Colour
      </label>
      {/* The swatch sits inside the input's box; the box takes the focus border. */}
      <div className="mt-2 flex items-center border border-rule bg-cell focus-within:border-ink">
        <span
          aria-hidden
          className={`ml-3 size-4 shrink-0 ${hex ? "" : "border border-rule"}`}
          style={hex ? { backgroundColor: hex } : undefined}
        />
        <input
          id={inputId}
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          className="w-full bg-transparent px-3 py-3 outline-none"
        />
      </div>

      {photoSrc && (
        <div className="mt-2 flex gap-4">
          <button
            type="button"
            aria-expanded={picking}
            onClick={() => {
              setPicking((open) => !open);
              setMessage(null);
            }}
            className={textButton}
          >
            Pick from photo
          </button>
          {hex && (
            <button type="button" onClick={() => onHexChange("")} className={textButton}>
              Clear
            </button>
          )}
        </div>
      )}

      {picking && photoSrc && (
        <div className="mt-4">
          {/* Picking needs a pointer; keyboard users can use DETECT AGAIN. */}
          <div onClick={pick} className="relative aspect-square w-full cursor-crosshair border border-rule">
            {/* A plain <img>: its pixels are read directly, which Next's
                resized copies wouldn't allow. Decorative: the photo is
                already shown on the page. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imageRef}
              src={photoSrc}
              crossOrigin="anonymous"
              alt=""
              draggable={false}
              className="absolute inset-0 h-full w-full object-contain p-8 select-none"
            />
          </div>
          <p role="status" className="mt-2 text-stone">
            {message ?? "Tap the garment to pick its colour."}
          </p>
          <div className="mt-2 flex gap-4">
            <button type="button" onClick={detectAgain} className={textButton}>
              Detect again
            </button>
            <button type="button" onClick={() => setPicking(false)} className={textButton}>
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
