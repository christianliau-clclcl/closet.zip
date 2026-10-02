import { MotionConfig } from "motion/react";
import ItemCell from "@/components/ItemCell";
import Swatch from "@/components/Swatch";
import { layoutTransition } from "@/lib/motion";
import type { Shelf } from "@/lib/shelves";
import { zoomStyles, type Zoom } from "@/lib/zoom";

type ShelvesProps = {
  shelves: Shelf[];
  zoom: Zoom;
  onOpen: (id: string) => void;
  onPreview: (id: string | null, anchor?: HTMLElement) => void;
};

// Shelves (DESIGN.md "Category row"), for SORT BY's Type, Colour and Brand:
// a heading with a count ("OUTERWEAR — 07"; Colour shelves start with their
// swatch), a rule line, then one sideways-scrolling row of cells that snaps
// to each piece. Cells are the same size as in the grid at the current zoom.
export default function Shelves({ shelves, zoom, onOpen, onPreview }: ShelvesProps) {
  return (
    <MotionConfig transition={layoutTransition} reducedMotion="user">
      <div className="flex flex-col gap-12">
        {shelves.map((shelf) => (
          <section key={shelf.key} aria-label={shelf.label}>
            <h2 className="flex items-center gap-2 border-b border-rule pb-2 text-label uppercase">
              {shelf.swatch && <Swatch hex={shelf.swatch} />}
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
