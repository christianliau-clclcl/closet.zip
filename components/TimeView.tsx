"use client";

import { useEffect, useRef } from "react";
import FadeImage from "@/components/FadeImage";
import { itemSummary, itemTitle } from "@/lib/format";
import { inOrder, slotName, timeline, type Slot } from "@/lib/timeline";
import type { Item } from "@/lib/types";
import type { Zoom } from "@/lib/zoom";

type TimeViewProps = {
  items: Item[];
  newestFirst: boolean; // the default; ORDER · OLDEST reverses it
  zoom: Zoom;
  onOpen: (id: string) => void;
  onPreview: (id: string | null, anchor?: HTMLElement) => void;
};

// The size of each piece (and month slot) in the desktop timeline, from the
// zoom slider. Large is big on purpose, so the timeline clearly runs off the
// edge and reads as scrollable.
const cellSize: Record<Zoom, string> = { small: "w-8", medium: "w-12", large: "w-48" };
// Phones: evenly stepped. Small is 48px; Medium is half the width beside the
// line (two per row, 4px apart); Large fills it (one per row).
const phoneCellSize: Record<Zoom, string> = { small: "w-12", medium: "w-[calc(50%-2px)]", large: "w-full" };
// What the browser should load for each size (the grid's thumbnails are 600px).
const imageSizes: Record<Zoom, string> = {
  small: "(min-width: 768px) 32px, 48px",
  medium: "(min-width: 768px) 48px, 35vw",
  large: "(min-width: 768px) 192px, 70vw",
};
// Desktop: room between the stacked pieces and the axis; more at Large.
const axisGap: Record<Zoom, string> = { small: "pb-1", medium: "pb-1", large: "pb-6" };

// Style over time (PRODUCT.md Milestone 13, DESIGN.md "Visualizations"): the
// pieces laid out by when they were acquired, in real time (empty months
// too, so gaps show), so the chart is made of the clothes themselves.
// Desktop: a horizontal timeline. Phones: the axis runs down the left side.
// Newest first by default (left on desktop, top on phones), or oldest first.
export default function TimeView(props: TimeViewProps) {
  const slots = inOrder(timeline(props.items), props.newestFirst);
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
// month and the year at the first month of each year in reading order; long
// gaps shortened to //; "N.D." at the end. Scrolls sideways and opens at the
// most recent end (the left when newest first, the right when oldest first).
function Horizontal({ slots, newestFirst, zoom, onOpen, onPreview }: LayoutProps) {
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = scroller.current;
    if (element) element.scrollLeft = newestFirst ? 0 : element.scrollWidth;
  }, [newestFirst]);

  return (
    <div ref={scroller} className="overflow-x-auto pt-8 pb-4">
      <ol
        aria-label={`Pieces by when you got them, ${newestFirst ? "newest" : "oldest"} first`}
        className="flex min-w-max items-end"
      >
        {slots.map((slot) =>
          slot.kind === "break" ? (
            // A long gap, shortened (13d): the axis pauses at //, with the
            // gap's length underneath. Just wide enough for that label.
            <li key={slot.key} aria-label={slotName(slot)} className="flex flex-col px-2">
              <div aria-hidden className="relative h-px">
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-label leading-none">
                  {"//"}
                </span>
              </div>
              <div aria-hidden className="h-2" />
              <span aria-hidden className="mt-1 h-4 text-label whitespace-nowrap text-stone uppercase">
                {slot.label}
              </span>
            </li>
          ) : (
          <li
            key={slot.key}
            aria-label={slot.items.length > 0 ? `${slotName(slot)}, ${slot.items.length}` : undefined}
            aria-hidden={slot.items.length === 0 ? true : undefined}
            // N.D. stands apart from the timeline: a gap before it.
            className={`flex flex-col ${cellSize[zoom]} ${slot.kind === "none" ? "ml-12" : ""}`}
          >
            {/* The pieces, stacked upwards from the axis. */}
            <ul className={`flex flex-col-reverse gap-1 px-0.5 ${axisGap[zoom]}`}>
              {slot.items.map((item) => (
                <li key={item.id}>
                  <TimePiece item={item} sizes={imageSizes[zoom]} onOpen={onOpen} onPreview={onPreview} />
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
          ),
        )}
      </ol>
    </div>
  );
}

const monthShort = (month: number) => new Date(2000, month - 1).toLocaleDateString("en", { month: "short" });

// Phones: the axis runs down the left side (newest or oldest at the top). Each month is
// a row: a tick on the line (longer, with the year beside it, where a year
// starts), the month's short name if it has pieces, then its pieces in a row
// that wraps. Empty months are short 12px rows, so gaps still read as gaps;
// long gaps are shortened to a // row. "N.D." sits at the bottom after a gap.
function Vertical({ slots, newestFirst, zoom, onOpen, onPreview }: LayoutProps) {
  const dated = slots.filter((slot) => slot.kind !== "none");
  const undated = slots.find((slot) => slot.kind === "none");

  const row = (slot: Slot, yearLabel: string | undefined, line: boolean) =>
    slot.kind === "break" ? (
      // A long gap, shortened (13d): the line pauses at //, with its length.
      <li key={slot.key} aria-label={slotName(slot)} className="flex h-6 items-center">
        <span aria-hidden className="w-12 shrink-0" />
        <div aria-hidden className="relative flex flex-1 items-center pl-4">
          <span className="absolute left-0 -translate-x-1/2 text-label leading-none">{"//"}</span>
          <span className="text-label text-stone uppercase">{slot.label}</span>
        </div>
      </li>
    ) : (
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
                <li key={item.id} className={phoneCellSize[zoom]}>
                  <TimePiece item={item} sizes={imageSizes[zoom]} onOpen={onOpen} onPreview={onPreview} />
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
        <ol aria-label={`Pieces by when you got them, ${newestFirst ? "newest" : "oldest"} first`}>
          {dated.map((slot) => row(slot, slot.label, true))}
        </ol>
      )}
      {undated && <ol className="mt-12">{row(undated, "N.D.", false)}</ol>}
    </div>
  );
}

// One piece in the timeline: tap to open it; hover (or keyboard focus) shows
// the hover label, as in the grid.
function TimePiece({
  item,
  sizes,
  onOpen,
  onPreview,
}: Pick<TimeViewProps, "onOpen" | "onPreview"> & { item: Item; sizes: string }) {
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
        sizes={sizes}
        unoptimized={item.hero.unoptimized}
        className="object-contain"
      />
    </button>
  );
}
