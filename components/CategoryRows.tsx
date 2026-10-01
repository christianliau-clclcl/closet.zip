import { MotionConfig } from "motion/react";
import ItemCell from "@/components/ItemCell";
import { formatCategory } from "@/lib/format";
import { layoutTransition } from "@/lib/motion";
import type { Category, Item } from "@/lib/types";
import { zoomStyles, type Zoom } from "@/lib/zoom";

const categoryOrder: Category[] = ["tops", "bottoms", "outerwear", "shoes", "accessories"];

type CategoryRowsProps = {
  items: Item[];
  zoom: Zoom;
  onOpen: (id: string) => void;
  onPreview: (id: string | null, anchor?: HTMLElement) => void;
};

// The ROWS view (DESIGN.md "Category row"): one shelf per category, like a
// closet. A heading with a count ("OUTERWEAR — 07"), a rule line, then one
// sideways-scrolling row of cells that snaps to each piece. Cells are the same
// size as in the grid at the current zoom. Empty categories are skipped;
// pieces without a category come last.
export default function CategoryRows({ items, zoom, onOpen, onPreview }: CategoryRowsProps) {
  const shelves = [
    ...categoryOrder.map((category) => ({
      label: formatCategory(category),
      items: items.filter((item) => item.category === category),
    })),
    { label: "No category", items: items.filter((item) => !item.category) },
  ].filter((shelf) => shelf.items.length > 0);

  return (
    <MotionConfig transition={layoutTransition} reducedMotion="user">
      <div className="flex flex-col gap-12">
        {shelves.map((shelf) => (
          <section key={shelf.label} aria-label={shelf.label}>
            <h2 className="border-b border-rule pb-2 text-label uppercase">
              {shelf.label} — {String(shelf.items.length).padStart(2, "0")}
            </h2>
            <ul className="mt-2 flex snap-x snap-mandatory gap-2 overflow-x-auto">
              {shelf.items.map((item) => (
                <ItemCell
                  key={item.id}
                  item={item}
                  zoom={zoom}
                  onOpen={onOpen}
                  onPreview={onPreview}
                  className={`shrink-0 snap-start ${zoomStyles[zoom].rowCell}`}
                />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </MotionConfig>
  );
}
