"use client";

import { useState } from "react";
import { readClipboardImage, useCanReadClipboard } from "@/lib/clipboard";

type PasteButtonProps = {
  onImage: (file: File) => void;
  disabled?: boolean;
};

// PASTE: takes a copied image from the clipboard (useful on phones, where
// there's no ⌘V). Only shown in browsers that can read clipboard images.
// If there's no image, says so briefly instead.
export default function PasteButton({ onImage, disabled }: PasteButtonProps) {
  const canRead = useCanReadClipboard();
  const [message, setMessage] = useState<string | null>(null);
  if (!canRead) return null;

  async function paste() {
    setMessage(null);
    try {
      const file = await readClipboardImage();
      if (file) onImage(file);
      else setMessage("No image copied");
    } catch {
      // Permission refused, or the clipboard couldn't be read.
      setMessage("Couldn't paste");
    }
  }

  return (
    <span className="inline-flex items-baseline gap-2">
      <button
        type="button"
        onClick={paste}
        disabled={disabled}
        className="cursor-pointer text-label uppercase underline underline-offset-4 disabled:cursor-wait"
      >
        Paste
      </button>
      {message && (
        <span role="status" className="text-label text-stone uppercase">
          {message}
        </span>
      )}
    </span>
  );
}
