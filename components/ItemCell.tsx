import { motion } from "motion/react";
import FadeImage from "@/components/FadeImage";
import { itemSummary, itemTitle } from "@/lib/format";
import { useSelection } from "@/lib/selection";
import type { Item } from "@/lib/types";
import { zoomStyles, type Zoom } from "@/lib/zoom";

type ItemCellProps = {
  item: Item;
  zoom: Zoom;
  onOpen: (id: string) => void;
  // Hovered or focused: show in the hover label. `anchor` is the cell when it
  // was focused with the keyboard, so the label sits under it, not the pointer.
  onPreview: (id: string | null, anchor?: HTMLElement) => void;
  className?: string; // e.g. width and scroll snapping in a category row
};

// One square cell: the garment floats on the canvas, centred and never cropped,
// with a grid dot at the top-left and, at Large zoom, its name underneath.
// Hovering or focusing it shows "brand | year" in the HoverLabel.
// It's a button so it can be focused with the keyboard, and clicking or
// tapping it opens the detail overlay. In SELECT mode, tapping selects it
// instead, shown by a small square at the top-right (filled when chosen).
export default function ItemCell({ item, zoom, onOpen, onPreview, className }: ItemCellProps) {
  const style = zoomStyles[zoom];
  const archived = item.status === "archived";
  const selection = useSelection();
  const selected = selection.active && selection.selected.has(item.id);

  return (
    // layout: when the zoom changes the columns, the cell glides to its new
    // place and size instead of jumping (timing from MotionConfig in ItemGrid).
    <motion.li layout className={className}>
      <button
        type="button"
        onClick={() => (selection.active ? selection.toggle(item.id) : onOpen(item.id))}
        aria-pressed={selection.active ? selected : undefined}
        onMouseEnter={() => onPreview(item.id)}
        onMouseLeave={() => onPreview(null)}
        // Only keyboard focus (:focus-visible) moves the label under the cell;
        // a click also focuses the button, but the label should stay at the pointer.
        onFocus={(event) => {
          if (event.currentTarget.matches(":focus-visible")) onPreview(item.id, event.currentTarget);
        }}
        onBlur={() => onPreview(null)}
        // Screen readers hear the full line, since the hover label is visual only.
        aria-label={[itemSummary(item) || itemTitle(item), archived && "Archived"].filter(Boolean).join(" · ")}
        className={`relative flex aspect-square w-full cursor-pointer flex-col ${style.padding} focus-visible:outline-1 focus-visible:outline-ink`}
      >
        <span aria-hidden className="absolute top-2 left-2 size-0.75 rounded-full bg-ink" />
        {selection.active && (
          <span
            aria-hidden
            className={`absolute top-2 right-2 size-3 border border-ink ${selected ? "bg-ink" : "bg-transparent"}`}
          />
        )}
        <span className="relative block flex-1">
          <FadeImage
            src={item.hero.thumbSrc ?? item.hero.src}
            alt={itemTitle(item)}
            fill
            sizes={style.sizes}
            unoptimized={item.hero.unoptimized}
            className="object-contain"
          />
        </span>
        {style.showName && item.name && (
          <span className="mt-2 block truncate text-center">{item.name}</span>
        )}
      </button>
    </motion.li>
  );
}
