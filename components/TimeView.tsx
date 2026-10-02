"use client";

import { useEffect, useRef } from "react";
import FadeImage from "@/components/FadeImage";
import { itemSummary, itemTitle } from "@/lib/format";
import { slotName, timeline } from "@/lib/timeline";
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

// Style over time (PRODUCT.md Milestone 13, DESIGN.md "Visualizations"): a
// horizontal timeline in real time, one slot per month (empty months too, so
// gaps show). Pieces stack above their month, so the chart is made of the
// clothes themselves. A 1px ink axis with a tick per month and the year where
// each year starts; "N.D." (no date) at the end. Scrolls sideways and opens at
// the most recent end.
export default function TimeView({ items, zoom, onOpen, onPreview }: TimeViewProps) {
  const scroller = useRef<HTMLDivElement>(null);
  const slots = timeline(items);

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
                </li>
              ))}
            </ul>
            {/* The axis: one continuous line made of each slot's piece, a tick
                per month, taller where a year starts. */}
            <div aria-hidden className="h-px w-full bg-ink" />
            {/* Ticks and labels sit at the slot's left edge, where its time starts. */}
            {/* Every slot reserves the taller tick's height, so the axis stays level. */}
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
