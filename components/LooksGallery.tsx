import Link from "next/link";
import HiddenIcon from "@/components/HiddenIcon";
import LookBoard from "@/components/LookBoard";
import type { Item, Look } from "@/lib/types";
import { zoomStyles, type Zoom } from "@/lib/zoom";

type LooksGalleryProps = {
  looks: Look[];
  items: Item[];
  zoom: Zoom;
  closetHref?: string; // someone's public closet ("/@sam"): links go to its look pages (17e)
};

// The LOOKS tab (Milestone 17b): your looks as a gallery, each a small copy
// of its board with its name underneath in label style (no count, the
// user's call, 2026-10-06).
// Each opens its own page (/looks/<id>).
export default function LooksGallery({ looks, items, zoom, closetHref }: LooksGalleryProps) {
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
              href={closetHref ? `${closetHref}/looks/${look.id}` : `/looks/${look.id}`}
              aria-label={`${look.name}, look, ${count} ${count === 1 ? "piece" : "pieces"}${look.hidden ? ", hidden from public" : ""}`}
              className="relative flex flex-col focus-visible:outline-1 focus-visible:outline-ink"
            >
              <span aria-hidden className="absolute top-2 left-2 z-10 size-0.75 rounded-full bg-ink" />
              {look.hidden && <HiddenIcon className="absolute top-2 right-2 z-10" />}
              <span className={`block ${zoomStyles[zoom].padding}`}>
                <LookBoard pieces={look.pieces} items={byId} thumbnail />
              </span>
              <span className="mt-2 mb-4 block truncate px-1 text-center text-label uppercase">{look.name}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
