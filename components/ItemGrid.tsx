import { MotionConfig } from "motion/react";
import ItemCell from "@/components/ItemCell";
import { layoutTransition } from "@/lib/motion";
import type { Item } from "@/lib/types";
import { zoomStyles, type Zoom } from "@/lib/zoom";

type ItemGridProps = {
  items: Item[];
  zoom: Zoom;
  onOpen: (id: string) => void;
  onPreview: (id: string | null, anchor?: HTMLElement) => void;
};

// The closet grid: 8px between cells, column count set by the zoom level.
export default function ItemGrid({ items, zoom, onOpen, onPreview }: ItemGridProps) {
  return (
    // reducedMotion="user": people who've turned on "Reduce motion" on their
    // device get the instant switch instead of the animation.
    <MotionConfig transition={layoutTransition} reducedMotion="user">
      <ul className={`grid gap-2 ${zoomStyles[zoom].columns}`}>
        {items.map((item) => (
          <ItemCell key={item.id} item={item} zoom={zoom} onOpen={onOpen} onPreview={onPreview} />
        ))}
      </ul>
    </MotionConfig>
  );
}
