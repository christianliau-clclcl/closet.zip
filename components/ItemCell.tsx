import Image from "next/image";
import { itemSummary, itemTitle } from "@/lib/format";
import type { Item } from "@/lib/types";
import { zoomStyles, type Zoom } from "@/lib/zoom";

type ItemCellProps = {
  item: Item;
  zoom: Zoom;
  onOpen: (id: string) => void;
  onPreview: (id: string | null) => void; // hovered or focused: show in the caption
};

// One square cell: the garment floats on the canvas, centred and never cropped,
// with a grid dot at the top-left and, at Large zoom, its name underneath.
// Hovering or focusing it shows "name · brand · year" in the HoverCaption.
// It's a button so it can be focused with the keyboard, and clicking or
// tapping it opens the detail overlay.
export default function ItemCell({ item, zoom, onOpen, onPreview }: ItemCellProps) {
  const style = zoomStyles[zoom];
  const archived = item.status === "archived";

  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen(item.id)}
        onMouseEnter={() => onPreview(item.id)}
        onMouseLeave={() => onPreview(null)}
        onFocus={() => onPreview(item.id)}
        onBlur={() => onPreview(null)}
        // Screen readers hear the full line, since the caption is visual only.
        aria-label={[itemSummary(item) || itemTitle(item), archived && "Archived"].filter(Boolean).join(" · ")}
        className={`relative flex aspect-square w-full cursor-pointer flex-col ${style.padding} focus-visible:outline-1 focus-visible:outline-ink`}
      >
        <span aria-hidden className="absolute top-2 left-2 size-0.75 rounded-full bg-ink" />
        <span className={`relative block flex-1 ${archived ? "opacity-50" : ""}`}>
          <Image
            src={item.hero.thumbSrc ?? item.hero.src}
            alt={itemTitle(item)}
            fill
            sizes={style.sizes}
            unoptimized={item.hero.unoptimized}
            className="object-contain"
          />
        </span>
        {style.showName && item.name && (
          <span className={`mt-2 block truncate text-center ${archived ? "text-pebble" : ""}`}>{item.name}</span>
        )}
      </button>
    </li>
  );
}
