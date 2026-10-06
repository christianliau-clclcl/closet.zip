"use client";

import ZoomSlider from "@/components/ZoomSlider";
import { sortLabels, sortShortLabels, sorts, type Sort } from "@/lib/sort-filter";
import { usePopover } from "@/lib/use-popover";
import type { Zoom } from "@/lib/zoom";

type SortByMenuProps = {
  inBottomBar: boolean; // phones: opens upwards and holds zoom too
  sortable: boolean; // false at the top of FOLDERS (only zoom applies there)
  options?: readonly Sort[]; // the arrangements offered; all of them by default
  sort: Sort;
  defaultSort: Sort; // My order once arranged, else Newest added
  onSortChange: (sort: Sort) => void;
  filterCount: number;
  onFilter: () => void; // opens the filter drawer
  archived: { shown: boolean; onToggle: () => void };
  timeOrder?: { newestFirst: boolean; onToggle: () => void }; // with Timeline
  zoom?: { value: Zoom; onChange: (zoom: Zoom) => void }; // phones only
};

// SORT BY (friend feedback, 2026-10-02): one panel for how you're looking
// at the closet: the arrangements (My order, Newest, Timeline, Type…; each
// picks a layout too), ORDER for the timeline, FILTER →, ARCHIVED · ON/OFF,
// and on phones ZOOM. Desktop: a dropdown in the view bar; phones: opens
// upwards from the bottom bar. The button names the arrangement when it
// isn't the default, plus "· N" for filters and archived pieces shown.
export default function SortByMenu({
  inBottomBar,
  sortable,
  options = sorts,
  sort,
  defaultSort,
  onSortChange,
  filterCount,
  onFilter,
  archived,
  timeOrder,
  zoom,
}: SortByMenuProps) {
  const { open, setOpen, wrapper } = usePopover();
  const chosen = sortable && sort !== defaultSort ? sortShortLabels[sort] : undefined;
  const narrowing = sortable ? filterCount + (archived.shown ? 1 : 0) : 0;
  // Phones have room for the choice only ("BRAND"); desktop says "SORT BY · BRAND".
  // Where there's nothing to sort (LOOKS, the top of FOLDERS) the panel only
  // holds zoom, so the button says so (18b).
  const label = !sortable
    ? "Zoom"
    : [inBottomBar ? (chosen ?? "Sort by") : chosen ? `Sort by · ${chosen}` : "Sort by", narrowing || null]
        .filter(Boolean)
        .join(" · ");

  const row = "cursor-pointer border-t border-rule pt-4 text-left text-label uppercase";

  return (
    <div ref={wrapper} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen(!open)}
        className="max-w-28 cursor-pointer truncate text-label whitespace-nowrap uppercase md:max-w-none"
      >
        {label}
      </button>
      {open && (
        <div
          className={`absolute z-20 flex w-64 flex-col gap-4 border border-rule bg-cell p-4 ${
            inBottomBar ? "bottom-full left-0 mb-3" : "top-full right-0 mt-3"
          }`}
        >
          {sortable && (
            <div>
              <p className="text-label text-stone uppercase">Sort by</p>
              <div className="mt-1">
                {options.map((option) => (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={sort === option}
                    onClick={() => {
                      onSortChange(option);
                      setOpen(false);
                    }}
                    className={`block w-full cursor-pointer py-2 text-left ${
                      sort === option ? "text-ink underline underline-offset-4" : "text-stone"
                    }`}
                  >
                    {sortLabels[option]}
                  </button>
                ))}
              </div>
            </div>
          )}
          {sortable && timeOrder && (
            <button type="button" onClick={timeOrder.onToggle} className={row}>
              Order · {timeOrder.newestFirst ? "Newest" : "Oldest"}
            </button>
          )}
          {sortable && (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onFilter();
              }}
              className={row}
            >
              {filterCount > 0 ? `Filter · ${filterCount}` : "Filter"} →
            </button>
          )}
          {sortable && (
            <button type="button" aria-pressed={archived.shown} onClick={archived.onToggle} className={row}>
              Archived · {archived.shown ? "On" : "Off"}
            </button>
          )}
          {zoom && (
            <div className={sortable ? "border-t border-rule pt-4" : ""}>
              <ZoomSlider value={zoom.value} onChange={zoom.onChange} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
