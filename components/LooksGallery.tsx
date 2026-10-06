import Link from "next/link";
import LookBoard from "@/components/LookBoard";
import { twoDigits } from "@/lib/folder-tree";
import type { Item, Look } from "@/lib/types";
import { zoomStyles, type Zoom } from "@/lib/zoom";

type LooksGalleryProps = {
  looks: Look[];
  items: Item[];
  zoom: Zoom;
};

// The LOOKS tab (Milestone 17b): your looks as a gallery, each a small copy
// of its board with "NAME — 06" underneath in label style, like folders.
// Each opens its own page (/looks/<id>).
export default function LooksGallery({ looks, items, zoom }: LooksGalleryProps) {
  const byId = new Map(items.map((item) => [item.id, item]));

  if (looks.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-20 text-center">
        <p className="text-stone">No looks yet. Put pieces together the way you wear them.</p>
        <Link href="/looks/new" className="text-label uppercase underline underline-offset-4">
          + New look
        </Link>
      </div>
    );
  }

  return (
    <ul className={`grid gap-2 ${zoomStyles[zoom].columns}`}>
      {looks.map((look) => {
        const count = look.pieces.filter((piece) => byId.has(piece.itemId)).length;
        return (
          <li key={look.id}>
            <Link
              href={`/looks/${look.id}`}
              aria-label={`${look.name}, look, ${count} ${count === 1 ? "piece" : "pieces"}`}
              className="relative flex flex-col focus-visible:outline-1 focus-visible:outline-ink"
            >
              <span aria-hidden className="absolute top-2 left-2 z-10 size-0.75 rounded-full bg-ink" />
              <span className={`block ${zoomStyles[zoom].padding}`}>
                <LookBoard pieces={look.pieces} items={byId} thumbnail />
              </span>
              <span className="mb-2 flex justify-center px-1 text-label uppercase">
                <span className="truncate">{look.name}</span>
                <span className="shrink-0 whitespace-pre"> — {twoDigits(count)}</span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
