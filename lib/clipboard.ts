"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

// Getting photos in by pasting (⌘V on a computer, or the PASTE button on a
// phone), e.g. a garment copied with iPhone's "Copy Subject", which arrives
// as a background-removed PNG. Transparency is kept by the usual resizing.

// The image in a paste (⌘V), if there is one.
export function imageFromPaste(event: ClipboardEvent): File | null {
  const files = [...(event.clipboardData?.files ?? [])];
  return files.find((file) => file.type.startsWith("image/")) ?? null;
}

// Reads an image from the clipboard after a tap on PASTE. On iPhone the
// system shows its own "Paste" bubble first: the site only sees the
// clipboard once you tap it. Null if there's no image on the clipboard.
export async function readClipboardImage(): Promise<File | null> {
  const items = await navigator.clipboard.read();
  for (const item of items) {
    const type = item.types.find((t) => t.startsWith("image/"));
    if (type) {
      const blob = await item.getType(type);
      return new File([blob], `pasted.${type.split("/")[1] ?? "png"}`, { type });
    }
  }
  return null;
}

// Whether this browser can read images from the clipboard (for PASTE).
// Checked in the browser only; the server always says no.
export function useCanReadClipboard(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => typeof navigator !== "undefined" && typeof navigator.clipboard?.read === "function",
    () => false,
  );
}

// Calls onImage when an image is pasted (⌘V) anywhere on the page while
// `enabled`. Pastes without an image (e.g. text into a field) are left alone.
export function usePasteImage(onImage: (file: File) => void, enabled = true) {
  const latest = useRef(onImage);
  useEffect(() => {
    latest.current = onImage;
  });
  useEffect(() => {
    if (!enabled) return;
    function onPaste(event: ClipboardEvent) {
      const file = imageFromPaste(event);
      if (!file) return;
      event.preventDefault();
      latest.current(file);
    }
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [enabled]);
}
