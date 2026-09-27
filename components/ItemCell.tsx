import Image from "next/image";
import CellLabel from "@/components/CellLabel";
import type { Item } from "@/lib/types";
import { zoomStyles, type Zoom } from "@/lib/zoom";

type ItemCellProps = {
  item: Item;
  zoom: Zoom;
  onOpen: (code: string) => void;
};

// One square catalog cell: the garment floats on the canvas, centred and never
// cropped, with a grid dot at the top-left and labels depending on zoom level.
// It's a button so it can be focused with the keyboard, and clicking or
// tapping it opens the detail overlay.
export default function ItemCell({ item, zoom, onOpen }: ItemCellProps) {
  const style = zoomStyles[zoom];
  const labels = [style.code, style.name, style.brand].filter((v) => v !== "never");
  // If every label is hover-only, the whole label area is left out on touch screens.
  const labelArea = labels.every((v) => v === "hover")
    ? "hidden [@media(hover:hover)]:block"
    : "block";

  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen(item.code)}
        className={`group relative flex aspect-square w-full cursor-pointer flex-col ${style.padding} focus-visible:outline-1 focus-visible:outline-ink`}
      >
        <span aria-hidden className="absolute top-2 left-2 size-0.75 rounded-full bg-ink" />
        <span className="relative block flex-1">
          <Image
            src={item.hero.src}
            alt={item.name ?? `Item ${item.code}`}
            fill
            sizes={style.sizes}
            className="object-contain"
          />
        </span>
        {labels.length > 0 && (
          <span className={`mt-2 ${labelArea}`}>
            <CellLabel visibility={style.code} className="text-label uppercase">
              {item.code}
            </CellLabel>
            <CellLabel visibility={style.name} className="text-stone">
              {item.name}
            </CellLabel>
            <CellLabel visibility={style.brand} className="text-stone">
              {item.brand}
            </CellLabel>
          </span>
        )}
      </button>
    </li>
  );
}
