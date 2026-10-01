"use client";

import { useEffect, useRef, useState } from "react";
import {
  countFilters,
  filterFields,
  filterItems,
  filterLabels,
  filterOptions,
  noFilters,
  type Filters,
} from "@/lib/sort-filter";
import type { Item } from "@/lib/types";

type FilterDrawerProps = {
  items: Item[]; // the current view's pieces, before filtering
  filters: Filters; // what's applied now
  onApply: (filters: Filters) => void;
  onClose: () => void;
};

// The filter drawer (DESIGN.md "Filter drawer"): slides in from the right over
// the grid on `cell`. Checkbox rows per detail, with how many pieces each
// matches; "Show N pieces" applies and closes. It's mounted only while open,
// so each time it starts from the filters already applied.
// A native <dialog>: Esc, focus trapping and returning focus are built in.
export default function FilterDrawer({ items, filters, onApply, onClose }: FilterDrawerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState<Filters>(filters);
  const options = filterOptions(items);
  const matching = filterItems(items, draft).length;

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  function toggle(field: (typeof filterFields)[number], value: string) {
    setDraft((current) => {
      const chosen = current[field];
      const next = chosen.some((c) => c.toLowerCase() === value.toLowerCase())
        ? chosen.filter((c) => c.toLowerCase() !== value.toLowerCase())
        : [...chosen, value];
      return { ...current, [field]: next };
    });
  }

  return (
    <dialog
      ref={dialogRef}
      aria-label="Filter"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      // A click outside the panel (on the backdrop) closes without applying.
      onClick={(event) => {
        const box = event.currentTarget.getBoundingClientRect();
        const outside =
          event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom;
        if (event.target === event.currentTarget && outside) onClose();
      }}
      className="m-0 ml-auto h-dvh max-h-none w-full max-w-sm flex-col bg-cell p-0 outline-none transition-transform duration-400 ease-[cubic-bezier(0.2,0,0,1)] open:flex starting:open:translate-x-full motion-reduce:transition-none backdrop:bg-scrim backdrop:backdrop-blur-md"
    >
      <div className="flex items-center justify-between border-b border-rule px-4 py-3 md:px-8">
        <h2 className="text-label uppercase">Filter</h2>
        <button type="button" onClick={onClose} aria-label="Close" className="cursor-pointer">
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
        {filterFields.map((field) =>
          options[field].length === 0 ? null : (
            <fieldset key={field} className="mb-8">
              <legend className="text-label text-stone uppercase">{filterLabels[field]}</legend>
              <div className="mt-2 border-t border-rule">
                {options[field].map((option) => {
                  const checked = draft[field].some((c) => c.toLowerCase() === option.value.toLowerCase());
                  return (
                    <label
                      key={option.value}
                      className="flex cursor-pointer items-center gap-3 border-b border-rule py-3"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggle(field, option.value)}
                        className="size-4 accent-ink"
                      />
                      <span className="flex-1">{option.label}</span>
                      <span className="text-stone">{option.count}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ),
        )}
      </div>

      <div className="flex flex-col gap-4 border-t border-rule px-4 py-4 md:px-8">
        <button
          type="button"
          onClick={() => setDraft(noFilters)}
          disabled={countFilters(draft) === 0}
          className="cursor-pointer self-start text-label uppercase underline-offset-4 hover:underline disabled:cursor-default disabled:text-pebble disabled:no-underline"
        >
          Clear all
        </button>
        <button
          type="button"
          onClick={() => onApply(draft)}
          className="w-full cursor-pointer bg-ink px-5 py-3 font-medium text-cell"
        >
          Show {matching} {matching === 1 ? "piece" : "pieces"}
        </button>
      </div>
    </dialog>
  );
}
