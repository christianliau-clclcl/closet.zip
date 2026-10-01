"use client";

import Link from "next/link";
import { Suspense, useRef, useState } from "react";
import HoverCaption from "@/components/HoverCaption";
import ItemGrid from "@/components/ItemGrid";
import ItemOverlay from "@/components/ItemOverlay";
import LogOutButton from "@/components/LogOutButton";
import TopBar from "@/components/TopBar";
import ZoomSlider from "@/components/ZoomSlider";
import type { Item } from "@/lib/types";
import { zoomStyles, type Zoom } from "@/lib/zoom";

// Runs in the browser so it can remember the zoom level as the slider moves
// and open or close the detail overlay.
type ClosetViewProps = {
  items: Item[];
  loggedIn: boolean;
};

export default function ClosetView({ items, loggedIn }: ClosetViewProps) {
  const [zoom, setZoom] = useState<Zoom>("medium");
  const [previewId, setPreviewId] = useState<string | null>(null);
  // True when the overlay was opened from the grid (so closing = going back),
  // false when the page was loaded straight from an item link.
  const openedFromGrid = useRef(false);

  function openItem(id: string) {
    window.history.pushState(null, "", `?item=${encodeURIComponent(id)}`);
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
      <TopBar>
        <ZoomSlider value={zoom} onChange={setZoom} />
        {loggedIn ? (
          <LogOutButton />
        ) : (
          <Link href="/login" className="text-label uppercase">
            Log in
          </Link>
        )}
      </TopBar>

      <main className="p-4 md:p-8">
        <h1 className="sr-only">Closet</h1>
        <ItemGrid items={items} zoom={zoom} onOpen={openItem} onPreview={setPreviewId} />
      </main>

      <HoverCaption
        item={items.find((item) => item.id === previewId)}
        nameShown={zoomStyles[zoom].showName}
      />

      {/* Reading the address happens in the browser only; Suspense lets the
          grid above load first without waiting for it. */}
      <Suspense fallback={null}>
        <ItemOverlay items={items} onClose={closeItem} />
      </Suspense>
    </>
  );
}
