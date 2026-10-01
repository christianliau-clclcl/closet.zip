"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import ItemActions from "@/components/ItemActions";
import ItemDetails from "@/components/ItemDetails";
import PhotoViewer from "@/components/PhotoViewer";
import { itemTitle } from "@/lib/format";
import type { Unit } from "@/lib/measurements";
import type { Item } from "@/lib/types";

type ItemOverlayProps = {
  items: Item[];
  onClose: () => void;
  editable: boolean; // your own items: show Edit etc. (never in the demo)
  unit: Unit;
  onUnitChange: (unit: Unit) => void;
};

// The detail overlay. It opens whenever the address has ?item=<id>, so the
// phone's Back button closes it and a link can open a specific item.
// It's a native <dialog>: Esc, focus trapping and returning focus to the
// garment afterwards are handled by the browser.
//
// Layout on desktop: the grid stays visible behind, darkened and blurred; the
// garment floats large on the left and the details sit in a panel on the right.
// On phones: a full-screen canvas page, garment on top and details below.
export default function ItemOverlay({ items, onClose, editable, unit, onUnitChange }: ItemOverlayProps) {
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
      // preventScroll: on phones the panel sits below the garment, and
      // focusing it would otherwise scroll the garment out of view.
      dialog.querySelector<HTMLElement>("[data-autofocus]")?.focus({ preventScroll: true });
      // Opening a dialog makes the browser focus (and scroll to) the first
      // focusable thing inside; on phones that can be the panel below the
      // photo. Always start at the top, with the garment in view.
      dialog.scrollTop = 0;
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
        // The space around the garment only counts as scrim on desktop; on
        // phones the overlay is a full page, so tapping beside the photo (or
        // a too-short swipe) shouldn't close it. Phones close with ✕ or Back.
        const desktop = window.matchMedia("(min-width: 768px)").matches;
        const onScrim = target === event.currentTarget || (desktop && "scrim" in target.dataset);
        const justOpened = performance.now() - openedAt.current < 300;
        if (onScrim && !justOpened) onClose();
      }}
      className="m-0 h-dvh max-h-none w-full max-w-none overflow-y-auto bg-canvas p-0 outline-none md:open:flex md:items-center md:gap-8 md:bg-transparent md:p-8 md:backdrop:bg-scrim md:backdrop:backdrop-blur-md"
    >
      {item && (
        <>
          <PhotoViewer key={item.id} photos={item.photos ?? [item.hero]} title={itemTitle(item)} />

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
            <ItemDetails item={item} unit={unit} onUnitChange={onUnitChange} />
          </div>
        </>
      )}
    </dialog>
  );
}
