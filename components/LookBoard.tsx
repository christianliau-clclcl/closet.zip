import FadeImage from "@/components/FadeImage";
import { itemSummary, itemTitle } from "@/lib/format";
import type { Item, LookPiece } from "@/lib/types";

type LookBoardProps = {
  pieces: LookPiece[];
  items: Map<string, Item>; // to find each piece's photo
  thumbnail?: boolean; // the gallery's small copy: smaller photo files
  framed?: boolean; // a look's page: on white with a rule outline, like ARRANGE
  // A look's page: tapping a piece opens its details, hovering shows its
  // label (the same as the closet's cells).
  onOpen?: (id: string) => void;
  onPreview?: (id: string | null, anchor?: HTMLElement) => void;
  className?: string;
};

// A look's board (Milestone 17): a 3:4 area with each piece's photo placed,
// sized, rotated and layered as saved. Positions are fractions of the board,
// so it draws the same at any size. In the gallery the garments float on the
// canvas, like the grid; on a look's page the board sits on white, as when
// arranging. Pieces deleted since are simply gone.
export default function LookBoard({
  pieces,
  items,
  thumbnail = false,
  framed = false,
  onOpen,
  onPreview,
  className = "",
}: LookBoardProps) {
  return (
    <div className={`relative aspect-[3/4] w-full ${framed ? "overflow-hidden border border-rule bg-cell" : ""} ${className}`}>
      {pieces.map((piece) => {
        const item = items.get(piece.itemId);
        if (!item) return null;
        const style = {
          left: `${piece.x * 100}%`,
          top: `${piece.y * 100}%`,
          width: `${piece.width * 100}%`,
          zIndex: piece.layer,
          transform: `translate(-50%, -50%) rotate(${piece.rotation}deg)`,
        };
        const photo = (
          <FadeImage
            src={thumbnail ? (item.hero.thumbSrc ?? item.hero.src) : item.hero.src}
            alt={onOpen ? "" : itemTitle(item)}
            width={600}
            height={600}
            sizes={thumbnail ? "20vw" : "50vw"}
            unoptimized={item.hero.unoptimized}
            className="block h-auto w-full"
          />
        );
        return onOpen ? (
          <button
            key={piece.itemId}
            type="button"
            onClick={() => onOpen(item.id)}
            onMouseEnter={() => onPreview?.(item.id)}
            onMouseLeave={() => onPreview?.(null)}
            onFocus={(event) => {
              if (event.currentTarget.matches(":focus-visible")) onPreview?.(item.id, event.currentTarget);
            }}
            onBlur={() => onPreview?.(null)}
            aria-label={itemSummary(item) || itemTitle(item)}
            className="absolute block cursor-pointer focus-visible:outline-1 focus-visible:outline-ink"
            style={style}
          >
            {photo}
          </button>
        ) : (
          <span key={piece.itemId} className="absolute block" style={style}>
            {photo}
          </span>
        );
      })}
    </div>
  );
}
