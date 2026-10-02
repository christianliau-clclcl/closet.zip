"use client";

import { usePopover } from "@/lib/use-popover";
import { sortLabels, sortShortLabels, sorts, type Sort } from "@/lib/sort-filter";

type SortMenuProps = {
  sort: Sort;
  onChange: (sort: Sort) => void;
  defaultSort: Sort; // My order once arranged, else Newest added
};

// SORT in the view bar: a small list under the button. Reads "SORT · BRAND"
// while a sort other than the default is chosen. Closes on choosing, Esc, or
// a click anywhere else.
export default function SortMenu({ sort, onChange, defaultSort }: SortMenuProps) {
  const { open, setOpen, wrapper } = usePopover();

  return (
    <div ref={wrapper} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen(!open)}
        className="cursor-pointer text-label whitespace-nowrap uppercase"
      >
        {sort === defaultSort ? "Sort" : `Sort · ${sortShortLabels[sort]}`}
      </button>
      {open && (
        <div className="absolute top-full right-0 z-20 mt-3 w-48 border border-rule bg-cell py-2">
          {sorts.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={sort === option}
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
              className={`block w-full cursor-pointer px-4 py-2 text-left ${
                sort === option ? "text-ink underline underline-offset-4" : "text-stone"
              }`}
            >
              {sortLabels[option]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
