"use client";

import { useEffect, useId, useRef, useState } from "react";
import BoxIcon from "@/components/BoxIcon";
import OptionPicker from "@/components/OptionPicker";
import type { CoverChoice } from "@/lib/folders-client";
import type { Item } from "@/lib/types";

type CoverChooserProps = {
  value: CoverChoice;
  onChange: (cover: CoverChoice) => void;
  pieces: Item[]; // the folder's own pieces, for PIECE (none for a new folder)
  currentImageSrc?: string; // the image it has now, if any
};

const kinds = ["box", "image", "piece"] as const;
type Kind = (typeof kinds)[number];

// The Cover part of the folder modal: BOX · IMAGE · PIECE, with a preview
// square of the result. IMAGE asks for a file (resized when saving); PIECE
// shows the folder's garments to tap.
export default function CoverChooser({ value, onChange, pieces, currentImageSrc }: CoverChooserProps) {
  const inputId = useId();
  // The option showing. It can be IMAGE before a file is chosen; until then
  // the saved cover stays what it was (the box, for a new folder).
  const [kind, setKind] = useState<Kind>(value.kind === "current-image" ? "image" : value.kind);
  const options = pieces.length > 0 ? kinds : kinds.filter((k) => k !== "piece");

  // A preview of a newly chosen file, made when it's chosen and freed when
  // another is chosen or the modal closes.
  const [fileUrl, setFileUrl] = useState<string>();
  const fileUrlRef = useRef<string | undefined>(undefined);
  useEffect(() => () => {
    if (fileUrlRef.current) URL.revokeObjectURL(fileUrlRef.current);
  }, []);

  const previewSrc =
    kind !== "image" && (value.kind === "image" || value.kind === "current-image")
      ? undefined
      : value.kind === "image"
      ? fileUrl
      : value.kind === "current-image"
        ? currentImageSrc
        : value.kind === "piece"
          ? pieces.find((p) => p.id === value.itemId)?.hero.thumbSrc
          : undefined;

  function choose(next: Kind | "") {
    // Tapping the chosen option again clears it, which means the box.
    setKind(next || "box");
    if (next === "image") {
      // Back to the image it already had; otherwise wait for a file.
      if (currentImageSrc) onChange({ kind: "current-image" });
    } else if (next === "piece") onChange({ kind: "piece", itemId: pieces[0].id });
    else onChange({ kind: "box" });
  }

  return (
    <div>
      <OptionPicker legend="Cover" options={options} value={kind} onChange={choose} />

      <div className="mt-4 flex items-end gap-4">
        {/* The preview: the same contained look as a folder in the grid. */}
        <div className="relative size-32 shrink-0 border border-rule">
          {previewSrc ? (
            // A plain <img>: a local file or an already-resized photo.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewSrc} alt="" className="absolute inset-0 h-full w-full object-contain p-2" />
          ) : (
            <BoxIcon className="absolute inset-0 h-full w-full" />
          )}
        </div>
        {kind === "image" && (
          <div>
            <input
              id={inputId}
              type="file"
              accept="image/*"
              className="peer sr-only"
              onChange={(event) => {
                const chosen = event.target.files?.[0];
                if (!chosen) return;
                if (fileUrlRef.current) URL.revokeObjectURL(fileUrlRef.current);
                fileUrlRef.current = URL.createObjectURL(chosen);
                setFileUrl(fileUrlRef.current);
                onChange({ kind: "image", file: chosen });
              }}
            />
            <label
              htmlFor={inputId}
              className="cursor-pointer text-label uppercase underline underline-offset-4 peer-focus-visible:outline-1 peer-focus-visible:outline-ink"
            >
              {previewSrc ? "Change image" : "Choose image"}
            </label>
            <p className="mt-2 text-stone">A PNG with the background removed works best.</p>
          </div>
        )}
      </div>

      {kind === "piece" && (
        <div className="mt-4 grid grid-cols-4 gap-2">
          {pieces.map((piece) => {
            const chosen = value.kind === "piece" && value.itemId === piece.id;
            return (
              <button
                key={piece.id}
                type="button"
                aria-pressed={chosen}
                aria-label={piece.name ?? "Untitled piece"}
                onClick={() => onChange({ kind: "piece", itemId: piece.id })}
                className={`relative aspect-square cursor-pointer border ${chosen ? "border-ink" : "border-transparent"}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={piece.hero.thumbSrc ?? piece.hero.src} alt="" className="absolute inset-0 h-full w-full object-contain p-1" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
