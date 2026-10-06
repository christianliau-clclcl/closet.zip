import FadeImage from "@/components/FadeImage";
import { itemTitle } from "@/lib/format";
import type { Item, LookPiece } from "@/lib/types";

type LookBoardProps = {
  pieces: LookPiece[];
  items: Map<string, Item>; // to find each piece's photo
  thumbnail?: boolean; // the gallery's small copy: smaller photo files
  className?: string;
};

// A look's board (Milestone 17): a 3:4 area with each piece's photo placed,
// sized, rotated and layered as saved. Positions are fractions of the board,
// so it draws the same at any size. No background, like the grid: the
// garments float on the canvas. Pieces deleted since are simply gone.
export default function LookBoard({ pieces, items, thumbnail = false, className = "" }: LookBoardProps) {
  return (
    <div className={`relative aspect-[3/4] w-full ${className}`}>
      {pieces.map((piece) => {
        const item = items.get(piece.itemId);
        if (!item) return null;
        return (
          <span
            key={piece.itemId}
            className="absolute block"
            style={{
              left: `${piece.x * 100}%`,
              top: `${piece.y * 100}%`,
              width: `${piece.width * 100}%`,
              zIndex: piece.layer,
              transform: `translate(-50%, -50%) rotate(${piece.rotation}deg)`,
            }}
          >
            <FadeImage
              src={thumbnail ? (item.hero.thumbSrc ?? item.hero.src) : item.hero.src}
              alt={itemTitle(item)}
              width={600}
              height={600}
              sizes={thumbnail ? "20vw" : "50vw"}
              unoptimized={item.hero.unoptimized}
              className="block h-auto w-full"
            />
          </span>
        );
      })}
    </div>
  );
}
