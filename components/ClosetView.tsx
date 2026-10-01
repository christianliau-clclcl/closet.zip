"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useRef, useState } from "react";
import CategoryRows from "@/components/CategoryRows";
import EmptyState from "@/components/EmptyState";
import FilterDrawer from "@/components/FilterDrawer";
import FolderView from "@/components/FolderView";
import HoverLabel from "@/components/HoverLabel";
import ItemGrid from "@/components/ItemGrid";
import ItemOverlay from "@/components/ItemOverlay";
import LogOutButton from "@/components/LogOutButton";
import SortMenu from "@/components/SortMenu";
import TopBar from "@/components/TopBar";
import ViewBar from "@/components/ViewBar";
import ViewEmpty from "@/components/ViewEmpty";
import ZoomSlider from "@/components/ZoomSlider";
import { useColourBackfill } from "@/lib/colour-backfill";
import { folderPath, itemsInFolder } from "@/lib/folder-tree";
import type { Unit } from "@/lib/measurements";
import { saveMyUnit } from "@/lib/profile-client";
import type { Folder, Item } from "@/lib/types";
import {
  countFilters,
  filterFields,
  filterItems,
  noFilters,
  readFilters,
  readSort,
  sortItems,
  type Filters,
  type Sort,
} from "@/lib/sort-filter";
import { itemsInView, readView, views, withParam, withParams, type View } from "@/lib/views";
import type { Zoom } from "@/lib/zoom";

// Runs in the browser so it can remember the zoom level as the slider moves,
// switch views and open or close the detail overlay. The view and the open
// piece live in the address (?view=…&item=…), so Back and links work.
type ClosetViewProps = {
  items: Item[];
  folders: Folder[]; // the logged-in person's folders (none in the demo)
  loggedIn: boolean;
  initialUnit: Unit; // for measurements in the overlay
};

export default function ClosetView({ items, folders, loggedIn, initialUnit }: ClosetViewProps) {
  const [zoom, setZoom] = useState<Zoom>("medium");
  // Your own pieces saved before colours existed get one in the background.
  useColourBackfill(items, loggedIn);
  // The hovered or focused piece, and the cell itself when focused by keyboard.
  const [preview, setPreview] = useState<{ id: string; anchor: HTMLElement | null } | null>(null);
  const showPreview = (id: string | null, anchor?: HTMLElement) =>
    setPreview(id ? { id, anchor: anchor ?? null } : null);
  const [unit, setUnit] = useState<Unit>(initialUnit);
  const params = useSearchParams();
  // FOLDERS is only for your own closet; the demo has none.
  const viewOptions: readonly View[] = loggedIn ? views : views.filter((v) => v !== "folders");
  const readFromAddress = readView(params);
  const view = viewOptions.includes(readFromAddress) ? readFromAddress : "all";
  // The open folder (FOLDERS view): none at the top level.
  const folder = view === "folders" ? folderPath(folders, params.get("folder") ?? undefined).at(-1) : undefined;
  const sort = readSort(params);
  const filters = readFilters(params);
  const filterCount = countFilters(filters);
  const [filterOpen, setFilterOpen] = useState(false);
  const inView = view === "folders" ? (folder ? itemsInFolder(items, folder) : []) : itemsInView(items, view);
  const shown = sortItems(filterItems(inView, filters), sort);

  function changeSort(next: Sort) {
    window.history.pushState(null, "", withParam("sort", next === "newest" ? null : next));
  }

  function applyFilters(next: Filters) {
    window.history.pushState(
      null,
      "",
      withParams((p) => {
        for (const field of filterFields) {
          p.delete(field);
          for (const value of next[field]) p.append(field, value);
        }
      }),
    );
    setFilterOpen(false);
  }

  // Instant: every piece is already loaded, so this only filters them.
  function changeView(next: View) {
    window.history.pushState(
      null,
      "",
      withParams((p) => {
        p.delete("folder");
        if (next === "all") p.delete("view");
        else p.set("view", next);
      }),
    );
  }

  // Each folder is its own address, so Back goes up a level.
  function openFolder(id: string | undefined) {
    window.history.pushState(null, "", withParam("folder", id ?? null));
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

      <ViewBar view={view} options={viewOptions} onChange={changeView}>
        {/* The top of FOLDERS is just folders: nothing to sort or filter. */}
        {(view !== "folders" || folder) && (
          <>
            <SortMenu sort={sort} onChange={changeSort} />
            <button
              type="button"
              onClick={() => setFilterOpen(true)}
              className="cursor-pointer text-label whitespace-nowrap uppercase"
            >
              {filterCount > 0 ? `Filter · ${filterCount}` : "Filter"}
            </button>
          </>
        )}
      </ViewBar>

      {filterOpen && (
        <FilterDrawer
          items={inView}
          filters={filters}
          onApply={applyFilters}
          onClose={() => setFilterOpen(false)}
        />
      )}

      {view === "folders" ? (
        <main className="flex flex-1 flex-col p-4 md:p-8">
          <FolderView
            folders={folders}
            items={items}
            folderId={folder?.id}
            pieces={shown}
            filtered={inView.length > shown.length}
            zoom={zoom}
            onOpenFolder={openFolder}
            onOpenItem={openItem}
            onPreview={showPreview}
            onClearFilters={() => applyFilters(noFilters)}
          />
        </main>
      ) : shown.length > 0 ? (
        <main className="p-4 md:p-8">
          <h1 className="sr-only">{view === "archive" ? "Archive" : "Closet"}</h1>
          {view === "rows" ? (
            <CategoryRows items={shown} zoom={zoom} onOpen={openItem} onPreview={showPreview} />
          ) : (
            <ItemGrid items={shown} zoom={zoom} onOpen={openItem} onPreview={showPreview} />
          )}
        </main>
      ) : (
        <main className="flex flex-1 flex-col">
          <h1 className="sr-only">{view === "archive" ? "Archive" : "Closet"}</h1>
          {inView.length > 0 ? (
            <ViewEmpty
              message="No pieces match these filters."
              action={{ label: "Clear filters", onClick: () => applyFilters(noFilters) }}
            />
          ) : (
            <ViewEmpty
              message={
                view === "archive"
                  ? "Nothing archived. Pieces you no longer own will appear here."
                  : "Nothing in your closet right now."
              }
            />
          )}
        </main>
      )}

      <HoverLabel item={items.find((item) => item.id === preview?.id)} anchor={preview?.anchor ?? null} />

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
