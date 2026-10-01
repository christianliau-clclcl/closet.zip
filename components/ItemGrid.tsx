import ItemCell from "@/components/ItemCell";
import type { Item } from "@/lib/types";
import { zoomStyles, type Zoom } from "@/lib/zoom";

type ItemGridProps = {
  items: Item[];
  zoom: Zoom;
  onOpen: (id: string) => void;
  onPreview: (id: string | null) => void;
};

// The closet grid: 8px between cells, column count set by the zoom level.
export default function ItemGrid({ items, zoom, onOpen, onPreview }: ItemGridProps) {
  return (
    <ul className={`grid gap-2 ${zoomStyles[zoom].columns}`}>
      {items.map((item) => (
        <ItemCell key={item.id} item={item} zoom={zoom} onOpen={onOpen} onPreview={onPreview} />
      ))}
    </ul>
  );
}
