import { motion } from "motion/react";
import BoxIcon from "@/components/BoxIcon";
import FadeImage from "@/components/FadeImage";
import { twoDigits, type FolderCover } from "@/lib/folder-tree";
import type { Folder } from "@/lib/types";
import { zoomStyles, type Zoom } from "@/lib/zoom";

type FolderCellProps = {
  folder: Folder;
  cover: FolderCover; // an uploaded image, a chosen piece, or the box
  count: number; // pieces directly in it
  zoom: Zoom;
  onOpen: (id: string) => void;
};

// A folder in the grid (PRODUCT.md Milestone 12): the same square cell as a
// piece, with its cover (the box icon by default, or a chosen garment or
// uploaded image, floating on the canvas) and, always, its name and count
// underneath in label style: "GRAILS — 07".
export default function FolderCell({ folder, cover, count, zoom, onOpen }: FolderCellProps) {
  const style = zoomStyles[zoom];

  return (
    <motion.li layout>
      <button
        type="button"
        onClick={() => onOpen(folder.id)}
        aria-label={`${folder.name}, folder, ${count} ${count === 1 ? "piece" : "pieces"}`}
        className="relative flex aspect-square w-full cursor-pointer flex-col focus-visible:outline-1 focus-visible:outline-ink"
      >
        <span aria-hidden className="absolute top-2 left-2 size-0.75 rounded-full bg-ink" />
        {/* The zoom level's padding goes around the cover only, so the label
            below can use the cell's full width (phone cells are narrow). */}
        <span className={`block flex-1 pb-0 ${style.padding}`}>
          <span className="relative block h-full">
            {cover.kind === "box" ? (
              <BoxIcon className="absolute inset-0 h-full w-full" />
            ) : (
              <FadeImage
                src={cover.kind === "image" ? cover.src : (cover.item.hero.thumbSrc ?? cover.item.hero.src)}
                alt=""
                fill
                sizes={style.sizes}
                unoptimized={cover.kind === "image" || cover.item.hero.unoptimized}
                className="object-contain"
              />
            )}
          </span>
        </span>
        {/* A long name is cut off with …, but the count always shows. */}
        <span className="mt-2 mb-2 flex justify-center px-1 text-label uppercase">
          <span className="truncate">{folder.name}</span>
          <span className="shrink-0 whitespace-pre"> — {twoDigits(count)}</span>
        </span>
      </button>
    </motion.li>
  );
}
