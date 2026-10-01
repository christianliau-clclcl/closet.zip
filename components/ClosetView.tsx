"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useRef, useState } from "react";
import EmptyState from "@/components/EmptyState";
import HoverCaption from "@/components/HoverCaption";
import ItemGrid from "@/components/ItemGrid";
import ItemOverlay from "@/components/ItemOverlay";
import LogOutButton from "@/components/LogOutButton";
import TopBar from "@/components/TopBar";
import ViewBar from "@/components/ViewBar";
import ViewEmpty from "@/components/ViewEmpty";
import ZoomSlider from "@/components/ZoomSlider";
import type { Unit } from "@/lib/measurements";
import { saveMyUnit } from "@/lib/profile-client";
import type { Item } from "@/lib/types";
import { itemsInView, readView, withParam, type View } from "@/lib/views";
import { zoomStyles, type Zoom } from "@/lib/zoom";

// Runs in the browser so it can remember the zoom level as the slider moves,
// switch views and open or close the detail overlay. The view and the open
// piece live in the address (?view=…&item=…), so Back and links work.
type ClosetViewProps = {
  items: Item[];
  loggedIn: boolean;
  initialUnit: Unit; // for measurements in the overlay
};

export default function ClosetView({ items, loggedIn, initialUnit }: ClosetViewProps) {
  const [zoom, setZoom] = useState<Zoom>("medium");
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [unit, setUnit] = useState<Unit>(initialUnit);
  const view = readView(useSearchParams());
  const shown = itemsInView(items, view);

  // Instant: every piece is already loaded, so this only filters them.
  function changeView(next: View) {
    window.history.pushState(null, "", withParam("view", next === "all" ? null : next));
  }

  // Kept while browsing, so every piece opens in the same unit; remembered in
  // the profile for logged-in people (demo visitors can switch, unsaved).
  function changeUnit(next: Unit) {
    setUnit(next);
    if (loggedIn) saveMyUnit(next);
  }
  // True when the overlay was opened from the grid (so closing = going back),
  // false when the page was loaded straight from an item link.
  const openedFromGrid = useRef(false);

  function openItem(id: string) {
    window.history.pushState(null, "", withParam("item", id));
    openedFromGrid.current = true;
  }

  function closeItem() {
    if (openedFromGrid.current) {
      openedFromGrid.current = false;
      window.history.back();
    } else {
      window.history.replaceState(null, "", withParam("item", null));
    }
  }

  if (items.length === 0) {
    return (
      <>
        <TopBar>
          {loggedIn && (
            <>
              <Link href="/add" className="text-label uppercase">
                Add
              </Link>
              <LogOutButton />
            </>
          )}
        </TopBar>
        <main className="flex flex-1 flex-col">
          <EmptyState />
        </main>
      </>
    );
  }

  return (
    <>
      <TopBar>
        <ZoomSlider value={zoom} onChange={setZoom} />
        {loggedIn ? (
          <>
            <Link href="/add" className="text-label uppercase">
              Add
            </Link>
            <LogOutButton />
          </>
        ) : (
          <Link href="/login" className="text-label uppercase">
            Log in
          </Link>
        )}
      </TopBar>

      <ViewBar view={view} onChange={changeView} />

      {shown.length > 0 ? (
        <main className="p-4 md:p-8">
          <h1 className="sr-only">{view === "archive" ? "Archive" : "Closet"}</h1>
          <ItemGrid items={shown} zoom={zoom} onOpen={openItem} onPreview={setPreviewId} />
        </main>
      ) : (
        <main className="flex flex-1 flex-col">
          <h1 className="sr-only">{view === "archive" ? "Archive" : "Closet"}</h1>
          <ViewEmpty
            message={
              view === "archive"
                ? "Nothing archived. Pieces you no longer own will appear here."
                : "Nothing in your closet right now."
            }
          />
        </main>
      )}

      <HoverCaption
        item={items.find((item) => item.id === previewId)}
        nameShown={zoomStyles[zoom].showName}
      />

      {/* Reading the address happens in the browser only; Suspense lets the
          grid above load first without waiting for it. */}
      <Suspense fallback={null}>
        <ItemOverlay
          items={items}
          onClose={closeItem}
          editable={loggedIn}
          unit={unit}
          onUnitChange={changeUnit}
        />
      </Suspense>
    </>
  );
}
