"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import ArrangeGrid from "@/components/ArrangeGrid";
import BottomBar from "@/components/BottomBar";
import CategoryRows from "@/components/CategoryRows";
import ClosetTopBar from "@/components/ClosetTopBar";
import EmptyState from "@/components/EmptyState";
import FilterDrawer from "@/components/FilterDrawer";
import FolderView from "@/components/FolderView";
import HoverLabel from "@/components/HoverLabel";
import ItemGrid from "@/components/ItemGrid";
import ItemOverlay from "@/components/ItemOverlay";
import SearchField from "@/components/SearchField";
import SelectActions from "@/components/SelectActions";
import TimeView from "@/components/TimeView";
import ViewMenu from "@/components/ViewMenu";
import SortMenu from "@/components/SortMenu";
import ViewBar from "@/components/ViewBar";
import ViewEmpty from "@/components/ViewEmpty";
import { useColourBackfill } from "@/lib/colour-backfill";
import { folderPath } from "@/lib/folder-tree";
import {
  addManyToFolder,
  createFolder,
  removeManyFromFolder,
  saveClosetOrder,
  saveFolderOrder,
} from "@/lib/folders-client";
import type { Unit } from "@/lib/measurements";
import { saveMyUnit } from "@/lib/profile-client";
import { searchItems } from "@/lib/search";
import { SelectionContext } from "@/lib/selection";
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
  folders: Folder[];
  initialUnit: Unit; // for measurements in the overlay
};

export default function ClosetView({ items, folders, initialUnit }: ClosetViewProps) {
  const [zoom, setZoom] = useState<Zoom>("medium");
  // Your own pieces saved before colours existed get one in the background.
  useColourBackfill(items);
  // The hovered or focused piece, and the cell itself when focused by keyboard.
  const [preview, setPreview] = useState<{ id: string; anchor: HTMLElement | null } | null>(null);
  const showPreview = (id: string | null, anchor?: HTMLElement) =>
    setPreview(id ? { id, anchor: anchor ?? null } : null);
  const [unit, setUnit] = useState<Unit>(initialUnit);
  const params = useSearchParams();
  const view = readView(params);
  // The open folder (FOLDERS view): none at the top level.
  const folder = view === "folders" ? folderPath(folders, params.get("folder") ?? undefined).at(-1) : undefined;
  // Once the closet (or the open folder) has been arranged, it opens in My order.
  const arranged = view === "folders" ? Boolean(folder?.arranged) : items.some((i) => i.sortPosition !== undefined);
  const defaultSort: Sort = arranged ? "mine" : "newest";
  const sort = readSort(params, defaultSort);
  const filters = readFilters(params);
  const filterCount = countFilters(filters);
  const [filterOpen, setFilterOpen] = useState(false);
  const router = useRouter();

  // SELECT mode (Milestone 12d): tap pieces to choose them, then add them to
  // a folder or take them out of the open one. Not kept in the address: it's
  // a moment's task, not a place.
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  // A short line in the bar after an action ("3 pieces added to Grails").
  const [status, setStatus] = useState<string | null>(null);
  useEffect(() => {
    if (!status) return;
    const timer = setTimeout(() => setStatus(null), 4000);
    return () => clearTimeout(timer);
  }, [status]);

  function stopSelecting() {
    setSelecting(false);
    setSelected(new Set());
  }

  function toggleSelected(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // Runs a folder change for the selected pieces, then leaves SELECT mode
  // and says what happened; on failure, stays in SELECT mode to try again.
  async function changeSelected(save: (ids: string[]) => Promise<string>) {
    try {
      const message = await save([...selected]);
      stopSelecting();
      setStatus(message);
      router.refresh();
    } catch {
      setStatus("Couldn't save. Check your connection and try again.");
    }
  }
  const pieces = (n: number) => `${n} ${n === 1 ? "piece" : "pieces"}`;
  // TIME shows archived pieces too, unless switched off (?archived=hide).
  const hideArchived = view === "time" && params.get("archived") === "hide";
  function toggleArchived() {
    window.history.pushState(null, "", withParam("archived", hideArchived ? null : "hide"));
  }
  // TIME reads newest first, unless reversed (?order=oldest).
  const newestFirst = !(view === "time" && params.get("order") === "oldest");
  function toggleTimeOrder() {
    window.history.pushState(null, "", withParam("order", newestFirst ? "oldest" : null));
  }

  // A folder's pieces in the closet's newest-first order; its own My order
  // is folder.itemIds.
  const inView =
    view === "folders"
      ? folder
        ? items.filter((item) => folder.itemIds.includes(item.id))
        : []
      : view === "time"
        ? hideArchived
          ? items.filter((item) => item.status !== "archived")
          : items // every piece, including those that left the closet
        : itemsInView(items, view);

  // ARRANGE (Milestone 12g): drag pieces into My order; DONE saves it in one go.
  const [arranging, setArranging] = useState(false);
  const [arrangeOrder, setArrangeOrder] = useState<Item[]>([]);
  // Just-saved order, used until the refreshed pieces arrive (they're a new
  // list then), so the grid doesn't flash the old order meanwhile.
  const [justSaved, setJustSaved] = useState<{ ids: string[]; items: Item[] } | null>(null);
  const myOrder = justSaved?.items === items ? justSaved.ids : folder?.itemIds;
  // TIME has no sort: time is the order.
  // Search (?q=), then filters, then the sort (TIME has none: time is the order).
  const query = params.get("q") ?? "";
  const matching = filterItems(searchItems(inView, query), filters);
  const shown = view === "time" ? matching : sortItems(matching, sort, myOrder);
  // When a search or filters hide every piece: what to say, and how to undo it.
  const noMatch =
    inView.length > 0 && shown.length === 0
      ? query.trim()
        ? { message: `Nothing matches “${query.trim()}”.`, action: { label: "Clear search", onClick: () => setQuery("") } }
        : { message: "No pieces match these filters.", action: { label: "Clear filters", onClick: () => applyFilters(noFilters) } }
      : undefined;
  const canArrange = (view === "all" || Boolean(folder)) && inView.length > 1;

  function startArranging() {
    setSelecting(false);
    // Every piece of the view in My order, ignoring filters and sort meanwhile.
    setArrangeOrder(sortItems(inView, "mine", myOrder));
    setArranging(true);
  }

  async function finishArranging() {
    const ids = arrangeOrder.map((item) => item.id);
    try {
      await (folder ? saveFolderOrder(folder.id, ids) : saveClosetOrder(ids));
      setJustSaved({ ids, items });
      setArranging(false);
      // Show My order, which is now the default.
      window.history.pushState(null, "", withParam("sort", null));
      setStatus("Order saved");
      router.refresh();
    } catch {
      setStatus("Couldn't save. Check your connection and try again.");
    }
  }

  // Typing updates the address without adding a Back step per letter.
  function setQuery(next: string) {
    window.history.replaceState(null, "", withParam("q", next ? next : null));
  }
  // Phones: SEARCH opens a field across the bottom bar.
  const [searchOpen, setSearchOpen] = useState(false);

  function changeSort(next: Sort) {
    window.history.pushState(null, "", withParam("sort", next === defaultSort ? null : next));
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
    stopSelecting();
    setArranging(false);
    window.history.pushState(
      null,
      "",
      withParams((p) => {
        p.delete("folder");
        p.delete("archived"); // TIME's switches
        p.delete("order");
        if (next === "all") p.delete("view");
        else p.set("view", next);
      }),
    );
  }

  // Each folder is its own address, so Back goes up a level.
  function openFolder(id: string | undefined) {
    window.history.pushState(null, "", withParam("folder", id ?? null));
  }

  // From a piece's details: close it and open the folder (Back returns to it).
  function openFolderFromItem(id: string) {
    openedFromGrid.current = false;
    window.history.pushState(
      null,
      "",
      withParams((p) => {
        p.delete("item");
        p.set("view", "folders");
        p.set("folder", id);
      }),
    );
  }

  // Kept while browsing, so every piece opens in the same unit, and
  // remembered in your profile.
  function changeUnit(next: Unit) {
    setUnit(next);
    saveMyUnit(next);
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

  // The top of FOLDERS is just folders: nothing to sort or filter. TIME
  // filters but doesn't sort (time is the order).
  const filterable = view !== "folders" || Boolean(folder);
  const sortable = filterable && view !== "time";

  // SELECT, for your own pieces wherever there are some to choose.
  const selectButton = sortable && (
    <button
      type="button"
      onClick={() => setSelecting(true)}
      className="cursor-pointer text-label whitespace-nowrap uppercase"
    >
      Select
    </button>
  );

  // ARRANGE, beside SELECT, where pieces can be put in order.
  const arrangeButton = canArrange && (
    <button type="button" onClick={startArranging} className="cursor-pointer text-label whitespace-nowrap uppercase">
      Arrange
    </button>
  );

  // The usual tools. Desktop (view bar): SORT · FILTER · SELECT. Phones
  // (bottom bar): VIEW (sort, filter and zoom in one panel) · SELECT.
  const tools = (inBottomBar: boolean) =>
    inBottomBar ? (
      <>
        <ViewMenu
          sortable={sortable}
          filterable={filterable}
          sort={sort}
          defaultSort={defaultSort}
          onSortChange={changeSort}
          filterCount={filterCount}
          onFilter={() => setFilterOpen(true)}
          zoom={zoom}
          onZoomChange={setZoom}
          archived={view === "time" ? { shown: !hideArchived, onToggle: toggleArchived } : undefined}
          timeOrder={view === "time" ? { newestFirst, onToggle: toggleTimeOrder } : undefined}
        />
        {filterable && (
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label={query.trim() ? `Search: ${query.trim()}` : undefined}
            className="flex max-w-20 cursor-pointer text-label whitespace-nowrap uppercase"
          >
            {/* While a search is on, the button shows it ("DENIM", cut with …
                if long): the bar has no room for SEARCH as well. */}
            {query.trim() ? <span className="truncate">“{query.trim()}”</span> : "Search"}
          </button>
        )}
        {selectButton}
        {arrangeButton}
      </>
    ) : (
      filterable && (
        <>
          <SearchField value={query} onChange={setQuery} className="w-48" />
          {sortable && <SortMenu sort={sort} onChange={changeSort} defaultSort={defaultSort} />}
          <button
            type="button"
            onClick={() => setFilterOpen(true)}
            className="cursor-pointer text-label whitespace-nowrap uppercase"
          >
            {filterCount > 0 ? `Filter · ${filterCount}` : "Filter"}
          </button>
          {view === "time" && (
            <button type="button" onClick={toggleTimeOrder} className="cursor-pointer text-label whitespace-nowrap uppercase">
              Order · {newestFirst ? "Newest" : "Oldest"}
            </button>
          )}
          {view === "time" && (
            <button
              type="button"
              aria-pressed={!hideArchived}
              onClick={toggleArchived}
              className="cursor-pointer text-label whitespace-nowrap uppercase"
            >
              Archived · {hideArchived ? "Off" : "On"}
            </button>
          )}
          {selectButton}
          {arrangeButton}
        </>
      )
    );

  // In SELECT mode the bar holds the selection's actions instead.
  const selectActions = (inBottomBar: boolean) => (
    <SelectActions
      count={selected.size}
      folders={folders}
      inFolder={Boolean(folder)}
      opensUp={inBottomBar}
      onDone={stopSelecting}
      onAdd={(folderId) =>
        changeSelected(async (ids) => {
          await addManyToFolder(folderId, ids);
          // Pieces already in the folder were skipped; say so honestly.
          const target = folders.find((f) => f.id === folderId);
          const name = target?.name ?? "the folder";
          const already = ids.filter((id) => target?.itemIds.includes(id)).length;
          const added = ids.length - already;
          if (added === 0) return `Already in ${name}`;
          return `${pieces(added)} added to ${name}${already > 0 ? ` (${already} already there)` : ""}`;
        })
      }
      onCreate={(name) =>
        changeSelected(async (ids) => {
          const folderId = await createFolder(name, undefined);
          await addManyToFolder(folderId, ids);
          return `${pieces(ids.length)} added to ${name.trim()}`;
        })
      }
      onRemove={() =>
        changeSelected(async (ids) => {
          if (!folder) return "";
          await removeManyFromFolder(folder.id, ids);
          return `${pieces(ids.length)} removed from ${folder.name}`;
        })
      }
    />
  );

  // What the bar shows: the selection's actions, a short status line after an
  // action, or the usual tools.
  const barContents = (inBottomBar: boolean) =>
    inBottomBar && searchOpen && !arranging && !selecting ? (
      <>
        <SearchField value={query} onChange={setQuery} autoFocus className="min-w-0 flex-1" />
        <button type="button" onClick={() => setSearchOpen(false)} className="cursor-pointer text-label uppercase">
          Done
        </button>
      </>
    ) : arranging ? (
      <>
        <span className="text-label text-stone uppercase">Arrange</span>
        <button type="button" onClick={() => setArranging(false)} className="cursor-pointer text-label uppercase">
          Cancel
        </button>
        <button type="button" onClick={finishArranging} className="cursor-pointer text-label uppercase">
          Done
        </button>
      </>
    ) : selecting ? (
      selectActions(inBottomBar)
    ) : status ? (
      <p role="status" className="text-label uppercase">
        {status}
      </p>
    ) : (
      tools(inBottomBar)
    );

  if (items.length === 0) {
    return (
      <>
        <ClosetTopBar />
        <main className="flex flex-1 flex-col">
          <EmptyState />
        </main>
      </>
    );
  }

  return (
    <SelectionContext.Provider value={{ active: selecting, selected, toggle: toggleSelected }}>
      <ClosetTopBar zoom={{ value: zoom, onChange: setZoom }} />

      {/* Desktop: SORT and FILTER on the right of the view bar. Phones: in the
          bottom bar instead (below), so the bars up top stay uncrowded. */}
      <ViewBar view={view} options={views} onChange={changeView}>
        <div className="hidden items-center gap-6 md:flex">{barContents(false)}</div>
      </ViewBar>

      <BottomBar
        tools={barContents(true)}
        action={
          !selecting &&
          !arranging &&
          !searchOpen && (
            <Link href="/add" className="text-label uppercase">
              + Add
            </Link>
          )
        }
      />

      {filterOpen && (
        <FilterDrawer
          items={inView}
          filters={filters}
          onApply={applyFilters}
          onClose={() => setFilterOpen(false)}
        />
      )}

      {arranging ? (
        <main className="p-4 pb-20 md:p-8">
          <h1 className="sr-only">Arrange</h1>
          <p className="mb-6 text-stone">
            Drag pieces into your order, or use ← →. On a phone, press and hold a piece to lift it.
          </p>
          <ArrangeGrid items={arrangeOrder} zoom={zoom} onReorder={setArrangeOrder} />
        </main>
      ) : view === "time" && shown.length > 0 ? (
        <main className="p-4 pb-20 md:p-8">
          <h1 className="sr-only">Style over time</h1>
          <TimeView items={shown} newestFirst={newestFirst} zoom={zoom} onOpen={openItem} onPreview={showPreview} />
        </main>
      ) : view === "folders" ? (
        <main className="flex flex-1 flex-col p-4 pb-20 md:p-8">
          <FolderView
            folders={folders}
            items={items}
            folderId={folder?.id}
            pieces={shown}
            noMatch={noMatch}
            zoom={zoom}
            onOpenFolder={openFolder}
            onOpenItem={openItem}
            onPreview={showPreview}
          />
        </main>
      ) : shown.length > 0 ? (
        <main className="p-4 pb-20 md:p-8">
          <h1 className="sr-only">{view === "archive" ? "Archive" : "Closet"}</h1>
          {view === "rows" ? (
            <CategoryRows items={shown} zoom={zoom} onOpen={openItem} onPreview={showPreview} />
          ) : (
            <ItemGrid items={shown} zoom={zoom} onOpen={openItem} onPreview={showPreview} />
          )}
        </main>
      ) : (
        <main className="flex flex-1 flex-col pb-20 md:pb-0">
          <h1 className="sr-only">{view === "archive" ? "Archive" : "Closet"}</h1>
          {noMatch ? (
            <ViewEmpty message={noMatch.message} action={noMatch.action} />
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
          folders={folders}
          onClose={closeItem}
          onOpenFolder={openFolderFromItem}
          unit={unit}
          onUnitChange={changeUnit}
        />
      </Suspense>
    </SelectionContext.Provider>
  );
}
