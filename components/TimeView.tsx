"use client";

import { useEffect, useRef } from "react";
import FadeImage from "@/components/FadeImage";
import { itemSummary, itemTitle } from "@/lib/format";
import { slotName, timeline, type Slot } from "@/lib/timeline";
import type { Item } from "@/lib/types";
import type { Zoom } from "@/lib/zoom";

type TimeViewProps = {
  items: Item[];
  zoom: Zoom;
  onOpen: (id: string) => void;
  onPreview: (id: string | null, anchor?: HTMLElement) => void;
};

// The size of each piece in the timeline, from the zoom slider (spacing scale).
const cellSize: Record<Zoom, string> = { small: "w-8", medium: "w-12", large: "w-20" };

// Style over time (PRODUCT.md Milestone 13, DESIGN.md "Visualizations"): the
// pieces laid out by when they were acquired, in real time (empty months
// too, so gaps show), so the chart is made of the clothes themselves.
// Desktop: a horizontal timeline. Phones: the axis runs down the left side,
// newest at the top.
export default function TimeView(props: TimeViewProps) {
  const slots = timeline(props.items);
  return (
    <>
      <div className="hidden md:block">
        <Horizontal slots={slots} {...props} />
      </div>
      <div className="md:hidden">
        <Vertical slots={slots} {...props} />
      </div>
    </>
  );
}

type LayoutProps = TimeViewProps & { slots: Slot[] };

// Desktop: pieces stacked above their month on a 1px ink axis, a tick per
// month and the year where each year starts; "N.D." at the end. Scrolls
// sideways and opens at the most recent end.
function Horizontal({ slots, zoom, onOpen, onPreview }: LayoutProps) {
  const scroller = useRef<HTMLDivElement>(null);

  // Open at the most recent end.
  useEffect(() => {
    const element = scroller.current;
    if (element) element.scrollLeft = element.scrollWidth;
  }, []);

  return (
    <div ref={scroller} className="overflow-x-auto pt-8 pb-4">
      <ol aria-label="Pieces by when you got them" className="flex min-w-max items-end">
        {slots.map((slot) => (
          <li
            key={slot.key}
            aria-label={slot.items.length > 0 ? `${slotName(slot)}, ${slot.items.length}` : undefined}
            aria-hidden={slot.items.length === 0 ? true : undefined}
            // N.D. stands apart from the timeline: a gap before it.
            className={`flex flex-col ${cellSize[zoom]} ${slot.kind === "none" ? "ml-12" : ""}`}
          >
            {/* The pieces, stacked upwards from the axis. */}
            <ul className="flex flex-col-reverse gap-1 px-0.5 pb-1">
              {slot.items.map((item) => (
                <li key={item.id}>
                  <TimePiece item={item} onOpen={onOpen} onPreview={onPreview} />
                </li>
              ))}
            </ul>
            {/* The axis: one continuous line made of each slot's piece. */}
            <div aria-hidden className="h-px w-full bg-ink" />
            {/* Ticks and labels sit at the slot's left edge, where its time
                starts. Every slot reserves the taller tick's height, so the
                axis stays level. */}
            <div aria-hidden className="h-2">
              <div className={`w-px ${slot.label ? "h-2 bg-ink" : "h-1 bg-rule"}`} />
            </div>
            <span aria-hidden className="mt-1 h-4 text-label whitespace-nowrap uppercase">
              {slot.label}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

const monthShort = (month: number) => new Date(2000, month - 1).toLocaleDateString("en", { month: "short" });

// Phones: the axis runs down the left side, newest at the top. Each month is
// a row: a tick on the line (longer, with the year beside it, where a year
// starts), the month's short name if it has pieces, then its pieces in a row
// that wraps. Empty months are short 12px rows, so gaps still read as gaps.
// "N.D." sits at the bottom after a gap.
function Vertical({ slots, zoom, onOpen, onPreview }: LayoutProps) {
  const dated = slots.filter((slot) => slot.kind !== "none").reverse();
  const undated = slots.find((slot) => slot.kind === "none");
  // Newest first, so a year's label goes on its latest month (its first row).
  const firstOfYear = new Set(
    dated.filter((slot, i) => i === 0 || dated[i - 1].year !== slot.year).map((slot) => slot.key),
  );

  const row = (slot: Slot, yearLabel: string | undefined, line: boolean) => (
    <li
      key={slot.key}
      aria-label={slot.items.length > 0 ? `${slotName(slot)}, ${slot.items.length}` : undefined}
      aria-hidden={slot.items.length === 0 ? true : undefined}
      className="flex"
    >
      {/* The year, in a narrow column left of the line. */}
      <span aria-hidden className="w-12 shrink-0 text-label uppercase">
        {yearLabel}
      </span>
      <div className={`flex min-h-3 flex-1 items-start gap-2 ${line ? "border-l border-ink" : ""}`}>
        {/* The tick: longer and ink where a year starts. */}
        {/* Every row reserves the longer tick's width, so month names line up. */}
        <span aria-hidden className="mt-2 w-3 shrink-0">
          <span className={`block h-px ${yearLabel ? "w-3 bg-ink" : "w-2 bg-rule"}`} />
        </span>
        {slot.items.length > 0 && (
          <>
            <span aria-hidden className="w-8 shrink-0 text-label text-stone uppercase">
              {slot.kind === "month" ? monthShort(slot.month!) : ""}
            </span>
            <ul className="flex flex-1 flex-wrap gap-1 pb-2">
              {slot.items.map((item) => (
                <li key={item.id} className={cellSize[zoom]}>
                  <TimePiece item={item} onOpen={onOpen} onPreview={onPreview} />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </li>
  );

  return (
    <div className="pt-2">
      {dated.length > 0 && (
        <ol aria-label="Pieces by when you got them, newest first">
          {dated.map((slot) => row(slot, firstOfYear.has(slot.key) ? String(slot.year) : undefined, true))}
        </ol>
      )}
      {undated && <ol className="mt-12">{row(undated, "N.D.", false)}</ol>}
    </div>
  );
}

// One piece in the timeline: tap to open it; hover (or keyboard focus) shows
// the hover label, as in the grid.
function TimePiece({ item, onOpen, onPreview }: Pick<TimeViewProps, "onOpen" | "onPreview"> & { item: Item }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(item.id)}
      onMouseEnter={() => onPreview(item.id)}
      onMouseLeave={() => onPreview(null)}
      onFocus={(event) => {
        if (event.currentTarget.matches(":focus-visible")) onPreview(item.id, event.currentTarget);
      }}
      onBlur={() => onPreview(null)}
      aria-label={itemSummary(item) || itemTitle(item)}
      className="relative block aspect-square w-full cursor-pointer focus-visible:outline-1 focus-visible:outline-ink"
    >
      <FadeImage
        src={item.hero.thumbSrc ?? item.hero.src}
        alt=""
        fill
        sizes="80px"
        unoptimized={item.hero.unoptimized}
        className="object-contain"
      />
    </button>
  );
}
