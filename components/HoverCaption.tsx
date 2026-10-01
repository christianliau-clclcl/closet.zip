import { itemSummary, leftSummary } from "@/lib/format";
import type { Item } from "@/lib/types";

type HoverCaptionProps = {
  item: Item | undefined;
  nameShown: boolean; // the name is already under the garment (Large zoom)
};

// One caption line for the whole grid, like a museum wall label: fixed at the
// bottom-left, showing the hovered or focused garment's "name · brand · year".
// Only on devices that can hover; on touch screens tapping opens the overlay.
// Hidden from screen readers, which hear the same text as each cell's label.
export default function HoverCaption({ item, nameShown }: HoverCaptionProps) {
  const text = item
    ? [itemSummary(item, { includeName: !nameShown }), item.status === "archived" && (leftSummary(item) ?? "Archived")]
        .filter(Boolean)
        .join(" · ")
    : "";
  if (!text) return null;

  return (
    <p
      aria-hidden
      className="fixed bottom-0 left-0 hidden bg-canvas px-4 py-3 md:px-8 [@media(hover:hover)]:block"
    >
      {text}
    </p>
  );
}
