"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useRef, useState } from "react";
import FadeImage from "@/components/FadeImage";
import HoverLabel from "@/components/HoverLabel";
import ItemOverlay from "@/components/ItemOverlay";
import LookBoard from "@/components/LookBoard";
import LookModal from "@/components/LookModal";
import SaveLookImage from "@/components/SaveLookImage";
import { itemSummary, itemTitle } from "@/lib/format";
import type { Unit } from "@/lib/measurements";
import { saveMyUnit } from "@/lib/profile-client";
import type { Folder, Item, Look } from "@/lib/types";
import { withParam } from "@/lib/views";

type LookViewProps = {
  look: Look;
  items: Item[];
  folders: Folder[]; // for a piece's details
  looks: Look[]; // yours: the looks a piece is in, in its details
  initialUnit: Unit;
  // Someone's public closet ("/@sam", 17e): read-only, links stay in it,
  // and listings show how to buy.
  visitor?: { closetHref: string; username: string; saleContact?: string };
};

// A look's page (Milestone 17b): the name in the serif, the board on white
// (as when arranging), the note, and its pieces as small photos. Hovering a
// piece, on the board or below, shows its label as in the closet; tapping it
// opens its details over this page (?item=…), so Back or ✕ returns to the
// look. SAVE IMAGE saves the board as a PNG (18b); ARRANGE opens the board's
// editor (17c); EDIT the name, note, PUBLIC PAGE and delete.
export default function LookView({ look, items, folders, looks, initialUnit, visitor }: LookViewProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [unit, setUnit] = useState<Unit>(initialUnit);
  const [preview, setPreview] = useState<{ id: string; anchor: HTMLElement | null } | null>(null);
  const showPreview = (id: string | null, anchor?: HTMLElement) => setPreview(id ? { id, anchor: anchor ?? null } : null);
  const closet = visitor?.closetHref ?? "/";
  const byId = new Map(items.map((item) => [item.id, item]));
  const pieces = look.pieces.map((piece) => byId.get(piece.itemId)).filter((item): item is Item => Boolean(item));
  // Only this look's pieces open here. True when opened from this page (so
  // closing = going back), false when the page was loaded with ?item=.
  const openedHere = useRef(false);

  function openItem(id: string) {
    setPreview(null);
    window.history.pushState(null, "", withParam("item", id));
    openedHere.current = true;
  }

  function closeItem() {
    if (openedHere.current) {
      openedHere.current = false;
      window.history.back();
    } else {
      window.history.replaceState(null, "", withParam("item", null));
    }
  }

  return (
    <main className="mx-auto w-full max-w-lg flex-1 px-4 pt-6 pb-32 md:pt-10">
      <div className="flex items-baseline justify-between gap-6">
        <Link href={`${closet}?view=looks`} className="text-label text-stone uppercase underline-offset-4 hover:underline">
          ← Looks
        </Link>
        <div className="flex flex-wrap justify-end gap-x-6 gap-y-2">
          {/* The board as a PNG, for you and visitors (18b). */}
          <SaveLookImage look={look} items={byId} />
          {!visitor && (
            <>
              {/* The board, freeform (17c). */}
              <Link href={`/looks/${look.id}/arrange`} className="text-label uppercase underline underline-offset-4">
                Arrange
              </Link>
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="cursor-pointer text-label uppercase underline underline-offset-4"
              >
                Edit
              </button>
            </>
          )}
        </div>
      </div>
      <h1 className="mt-6 font-serif text-title">{look.name}</h1>
      <LookBoard
        pieces={look.pieces}
        items={byId}
        framed
        onOpen={openItem}
        onPreview={showPreview}
        className="mt-6"
      />
      {look.note && <p className="mt-6 font-serif text-notes whitespace-pre-line">{look.note}</p>}

      <h2 className="mt-10 text-label text-stone uppercase">Pieces · {pieces.length}</h2>
      <ul className="mt-2 flex flex-wrap gap-2 border-t border-rule pt-2">
        {pieces.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => openItem(item.id)}
              onMouseEnter={() => showPreview(item.id)}
              onMouseLeave={() => showPreview(null)}
              onFocus={(event) => {
                if (event.currentTarget.matches(":focus-visible")) showPreview(item.id, event.currentTarget);
              }}
              onBlur={() => showPreview(null)}
              aria-label={itemSummary(item) || itemTitle(item)}
              className="relative block size-16 cursor-pointer focus-visible:outline-1 focus-visible:outline-ink"
            >
              <FadeImage
                src={item.hero.thumbSrc ?? item.hero.src}
                alt=""
                fill
                sizes="64px"
                unoptimized={item.hero.unoptimized}
                className="object-contain p-1"
              />
            </button>
          </li>
        ))}
      </ul>

      <HoverLabel item={preview ? byId.get(preview.id) : undefined} anchor={preview?.anchor ?? null} />

      {/* The piece's details, over this page; reading the address happens
          in the browser only, so Suspense lets the page load first. */}
      <Suspense fallback={null}>
        <ItemOverlay
          items={pieces}
          folders={folders}
          onClose={closeItem}
          onOpenFolder={(id) => router.push(`/?view=folders&folder=${id}`)}
          unit={unit}
          onUnitChange={(next) => {
            setUnit(next);
            if (!visitor) saveMyUnit(next); // a visitor's choice lasts for the visit
          }}
          readOnly={Boolean(visitor)}
          seller={visitor && { username: visitor.username, contact: visitor.saleContact }}
          looks={visitor ? undefined : looks}
        />
      </Suspense>

      {editing && <LookModal look={look} onClose={() => setEditing(false)} />}
    </main>
  );
}
