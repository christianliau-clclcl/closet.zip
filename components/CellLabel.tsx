import type { LabelVisibility } from "@/lib/zoom";

type CellLabelProps = {
  visibility: LabelVisibility;
  className: string;
  children?: React.ReactNode;
};

// One line of text under a garment. "hover" lines only take up space on
// devices that can hover (mouse or trackpad), and stay invisible until the
// cell is hovered or focused, so the garment never jumps. On touch screens
// they're left out entirely; tapping opens the overlay instead.
export default function CellLabel({ visibility, className, children }: CellLabelProps) {
  if (visibility === "never") return null;

  const shown =
    visibility === "always"
      ? "block"
      : "hidden [@media(hover:hover)]:block invisible group-hover:visible group-focus-visible:visible";

  // A non-breaking space keeps the line's height when the field is empty,
  // so every cell at the same zoom level stays identical.
  return <span className={`truncate text-center ${shown} ${className}`}>{children || " "}</span>;
}
