"use client";

import { MotionConfig } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import FolderCell from "@/components/FolderCell";
import FolderModal from "@/components/FolderModal";
import ItemCell from "@/components/ItemCell";
import ViewEmpty from "@/components/ViewEmpty";
import { childFolders, folderCover, folderPath, itemsInFolder } from "@/lib/folder-tree";
import { layoutTransition } from "@/lib/motion";
import type { Folder, Item } from "@/lib/types";
import { zoomStyles, type Zoom } from "@/lib/zoom";

type FolderViewProps = {
  folders: Folder[];
  items: Item[]; // every piece, to find covers and counts
  folderId: string | undefined; // the open folder; none for the top level
  pieces: Item[]; // the open folder's pieces, already searched, sorted and filtered
  // When a search or filters hide every piece: what to say, and how to undo it.
  noMatch?: { message: string; action: { label: string; onClick: () => void } };
  zoom: Zoom;
  onOpenFolder: (id: string | undefined) => void;
  onOpenItem: (id: string) => void;
  onPreview: (id: string | null, anchor?: HTMLElement) => void;
};

type Mode = "new" | "edit" | null; // which folder modal is open

// The FOLDERS view (PRODUCT.md Milestone 12). A path row on top
// ("FOLDERS / SEASONS / SUMMER": earlier parts go back up), with + NEW FOLDER
// and, inside a folder, EDIT; both open the folder modal (name, cover,
// delete). Then one grid: the folders inside first, then the pieces added to
// this folder directly.
export default function FolderView({
  folders,
  items,
  folderId,
  pieces,
  noMatch,
  zoom,
  onOpenFolder,
  onOpenItem,
  onPreview,
}: FolderViewProps) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(null);
  const path = folderPath(folders, folderId);
  const current = path.at(-1); // undefined at the top level, or for a folder that no longer exists
  const inside = childFolders(folders, current?.id);

  const action = "cursor-pointer text-label uppercase underline-offset-4 hover:underline";

  return (
    <>
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <nav aria-label="Folder path">
          <ol className="flex flex-wrap items-baseline gap-x-2 text-label uppercase">
            {[undefined, ...path].map((folder, index) => {
              const last = index === path.length;
              return (
                <li key={folder?.id ?? "top"} className="flex items-baseline gap-2">
                  {index > 0 && <span className="text-stone">/</span>}
                  {last ? (
                    <h1 aria-current="page">{folder?.name ?? "Folders"}</h1>
                  ) : (
                    <button type="button" onClick={() => onOpenFolder(folder?.id)} className={`${action} text-stone`}>
                      {folder?.name ?? "Folders"}
                    </button>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
        <div className="flex gap-6">
          <button type="button" onClick={() => setMode("new")} className={action}>
            + New folder
          </button>
          {current && (
            <button type="button" onClick={() => setMode("edit")} className={action}>
              Edit
            </button>
          )}
        </div>
      </div>

      {mode && (
        <FolderModal
          folder={mode === "edit" ? current : undefined}
          parentId={current?.id}
          pieces={mode === "edit" && current ? itemsInFolder(items, current) : []}
          folders={folders}
          onClose={() => setMode(null)}
          onSaved={() => {
            setMode(null);
            router.refresh();
          }}
          onDeleted={() => {
            setMode(null);
            onOpenFolder(current?.parentId); // back up to where it was
            router.refresh();
          }}
        />
      )}

      {inside.length + pieces.length > 0 ? (
        <MotionConfig transition={layoutTransition} reducedMotion="user">
          <ul className={`grid gap-2 ${zoomStyles[zoom].columns}`}>
            {inside.map((folder) => (
              <FolderCell
                key={folder.id}
                folder={folder}
                cover={folderCover(items, folder)}
                count={itemsInFolder(items, folder).length}
                zoom={zoom}
                onOpen={onOpenFolder}
              />
            ))}
            {pieces.map((item) => (
              <ItemCell key={item.id} item={item} zoom={zoom} onOpen={onOpenItem} onPreview={onPreview} />
            ))}
          </ul>
        </MotionConfig>
      ) : noMatch ? (
        <ViewEmpty message={noMatch.message} action={noMatch.action} />
      ) : current ? (
        <ViewEmpty message="This folder is empty. Add pieces to it from their details." />
      ) : (
        <ViewEmpty
          message="No folders yet. Make one for a collection: grails, a season, pieces to sell."
          action={{ label: "+ New folder", onClick: () => setMode("new") }}
        />
      )}
    </>
  );
}
