"use client";

import { useState } from "react";
import { lookImageName, renderLookImage } from "@/lib/look-image";
import type { Item, Look } from "@/lib/types";

type SaveLookImageProps = {
  look: Look;
  items: Map<string, Item>;
};

// SAVE IMAGE on a look's page (Milestone 18b): draws the board as a PNG
// (lib/look-image.ts). On phones and tablets it opens the share sheet, where
// Save Image puts it in Photos; elsewhere it downloads the file. Cancelling
// the share sheet isn't an error.
export default function SaveLookImage({ look, items }: SaveLookImageProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setBusy(true);
    setError(null);
    try {
      const blob = await renderLookImage(look.pieces, items);
      const file = new File([blob], lookImageName(look.name), { type: "image/png" });
      const touch = window.matchMedia("(pointer: coarse)").matches;
      if (touch && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: look.name });
      } else {
        const url = URL.createObjectURL(file);
        const link = document.createElement("a");
        link.href = url;
        link.download = file.name;
        link.click();
        // Give the download a moment to start before letting go of the file.
        setTimeout(() => URL.revokeObjectURL(url), 10_000);
      }
    } catch (problem) {
      if (!(problem instanceof DOMException && problem.name === "AbortError")) {
        setError("Couldn't save the image. Check your connection and try again.");
      }
    }
    setBusy(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={save}
        disabled={busy}
        className="cursor-pointer text-label uppercase underline underline-offset-4 disabled:cursor-wait"
      >
        {busy ? "Saving…" : "Save image"}
      </button>
      {error && (
        <p role="alert" className="basis-full text-right">
          {error}
        </p>
      )}
    </>
  );
}
