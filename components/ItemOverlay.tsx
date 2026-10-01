"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import ItemActions from "@/components/ItemActions";
import ItemDetails from "@/components/ItemDetails";
import { itemTitle } from "@/lib/format";
import type { Item } from "@/lib/types";

type ItemOverlayProps = {
  items: Item[];
  onClose: () => void;
  editable: boolean; // your own items: show Edit etc. (never in the demo)
};

// The detail overlay. It opens whenever the address has ?item=<id>, so the
// phone's Back button closes it and a link can open a specific item.
// It's a native <dialog>: Esc, focus trapping and returning focus to the
// garment afterwards are handled by the browser.
//
// Layout on desktop: the grid stays visible behind, darkened and blurred; the
// garment floats large on the left and the details sit in a panel on the right.
// On phones: a full-screen canvas page, garment on top and details below.
export default function ItemOverlay({ items, onClose, editable }: ItemOverlayProps) {
  const id = useSearchParams().get("item");
  const item = items.find((i) => i.id === id);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openedAt = useRef(0);

  // Keep the dialog in sync with the address.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (item && !dialog.open) {
      dialog.showModal();
      openedAt.current = performance.now();
      // Start on the panel rather than the ✕, so no focus box appears on the
      // ✕ and screen readers begin with the item itself.
      dialog.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    }
    if (!item && dialog.open) dialog.close();
  }, [item]);

  return (
    <dialog
      ref={dialogRef}
      aria-label={item ? itemTitle(item) : undefined}
      // Esc: close through the address, not directly, so history stays in step.
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      // Clicks on the scrim, or on the empty space around the garment, close.
      // Clicks right after opening are ignored, so a double-click on a
      // garment can't open and immediately close the overlay.
      onClick={(event) => {
        const target = event.target as HTMLElement;
        const onScrim = target === event.currentTarget || "scrim" in target.dataset;
        const justOpened = performance.now() - openedAt.current < 300;
        if (onScrim && !justOpened) onClose();
      }}
      className="m-0 h-dvh max-h-none w-full max-w-none overflow-y-auto bg-canvas p-0 outline-none md:flex md:items-center md:gap-8 md:bg-transparent md:p-8 md:backdrop:bg-scrim md:backdrop:backdrop-blur-md"
    >
      {item && (
        <>
          <div data-scrim className="relative aspect-square w-full md:aspect-auto md:h-full md:flex-1">
            <Image
              src={item.hero.src}
              alt={itemTitle(item)}
              fill
              sizes="(min-width: 768px) 60vw, 100vw"
              unoptimized={item.hero.unoptimized}
              className="object-contain p-12 md:p-8"
            />
          </div>

          <div
            data-autofocus
            tabIndex={-1}
            className="relative bg-canvas p-4 outline-none md:max-h-full md:w-5/12 md:overflow-y-auto md:p-8"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="fixed top-0 right-0 z-10 cursor-pointer bg-canvas p-4 focus-visible:outline-1 focus-visible:outline-ink md:absolute"
            >
              ✕
            </button>
            {item.status === "archived" && (
              <p className="mb-2 text-label text-stone uppercase">Archived</p>
            )}
            {item.name && <h2 className="pr-8 font-serif text-title">{item.name}</h2>}
            {editable && <ItemActions key={item.id} item={item} />}
            <ItemDetails item={item} />
          </div>
        </>
      )}
    </dialog>
  );
}
