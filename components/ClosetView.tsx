"use client";

import { Suspense, useRef, useState } from "react";
import ItemGrid from "@/components/ItemGrid";
import ItemOverlay from "@/components/ItemOverlay";
import ZoomSlider from "@/components/ZoomSlider";
import type { Item } from "@/lib/types";
import type { Zoom } from "@/lib/zoom";

// Runs in the browser so it can remember the zoom level as the slider moves
// and open or close the detail overlay.
export default function ClosetView({ items }: { items: Item[] }) {
  const [zoom, setZoom] = useState<Zoom>("medium");
  // True when the overlay was opened from the grid (so closing = going back),
  // false when the page was loaded straight from an item link.
  const openedFromGrid = useRef(false);

  function openItem(code: string) {
    window.history.pushState(null, "", `?item=${encodeURIComponent(code)}`);
    openedFromGrid.current = true;
  }

  function closeItem() {
    if (openedFromGrid.current) {
      openedFromGrid.current = false;
      window.history.back();
    } else {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }

  return (
    <>
      <header className="flex items-center justify-between border-b border-rule px-4 py-3 md:px-8">
        <p className="text-label uppercase">Closet.zip</p>
        <ZoomSlider value={zoom} onChange={setZoom} />
      </header>

      <main className="p-4 md:p-8">
        <h1 className="sr-only">Closet</h1>
        <ItemGrid items={items} zoom={zoom} onOpen={openItem} />
      </main>

      {/* Reading the address happens in the browser only; Suspense lets the
          grid above load first without waiting for it. */}
      <Suspense fallback={null}>
        <ItemOverlay items={items} onClose={closeItem} />
      </Suspense>
    </>
  );
}
