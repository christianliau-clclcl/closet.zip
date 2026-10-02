"use client";

import ZoomSlider from "@/components/ZoomSlider";
import { sortLabels, sorts, type Sort } from "@/lib/sort-filter";
import { usePopover } from "@/lib/use-popover";
import type { Zoom } from "@/lib/zoom";

type ViewMenuProps = {
  sortable: boolean; // false at the top of FOLDERS (only zoom applies there)
  sort: Sort;
  defaultSort: Sort; // My order once arranged, else Newest added
  onSortChange: (sort: Sort) => void;
  filterCount: number;
  onFilter: () => void; // opens the filter drawer
  zoom: Zoom;
  onZoomChange: (zoom: Zoom) => void;
};

// VIEW in the phone's bottom bar (DESIGN.md "Phones"): how you're looking at
// the closet, in one panel that opens upwards: the SORT options, FILTER (opens
// the drawer) and ZOOM. Reads "VIEW · 2" while a sort or filters are on.
// Desktop keeps these spread out in the bars.
export default function ViewMenu({
  sortable,
  sort,
  defaultSort,
  onSortChange,
  filterCount,
  onFilter,
  zoom,
  onZoomChange,
}: ViewMenuProps) {
  const { open, setOpen, wrapper } = usePopover();
  const active = sortable ? filterCount + (sort === defaultSort ? 0 : 1) : 0;

  return (
    <div ref={wrapper} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen(!open)}
        className="cursor-pointer text-label whitespace-nowrap uppercase"
      >
        {active > 0 ? `View · ${active}` : "View"}
      </button>
      {open && (
        <div className="absolute bottom-full left-0 z-20 mb-3 flex w-64 flex-col gap-4 border border-rule bg-cell p-4">
          {sortable && (
            <>
              <div>
                <p className="text-label text-stone uppercase">Sort</p>
                <div className="mt-1">
                  {sorts.map((option) => (
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
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onFilter();
                }}
                className="cursor-pointer border-t border-rule pt-4 text-left text-label uppercase"
              >
                {filterCount > 0 ? `Filter · ${filterCount}` : "Filter"} →
              </button>
            </>
          )}
          <div className={sortable ? "border-t border-rule pt-4" : ""}>
            <ZoomSlider value={zoom} onChange={onZoomChange} />
          </div>
        </div>
      )}
    </div>
  );
}
