"use client";

import { MotionConfig } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import FolderCell from "@/components/FolderCell";
import FolderDeleteConfirm from "@/components/FolderDeleteConfirm";
import FolderNameForm from "@/components/FolderNameForm";
import ItemCell from "@/components/ItemCell";
import ViewEmpty from "@/components/ViewEmpty";
import { childFolders, countFoldersInside, folderCover, folderPath, itemsInFolder } from "@/lib/folder-tree";
import { createFolder, deleteFolder, renameFolder } from "@/lib/folders-client";
import { layoutTransition } from "@/lib/motion";
import type { Folder, Item } from "@/lib/types";
import { zoomStyles, type Zoom } from "@/lib/zoom";

type FolderViewProps = {
  folders: Folder[];
  items: Item[]; // every piece, to find covers and counts
  folderId: string | undefined; // the open folder; none for the top level
  pieces: Item[]; // the open folder's pieces, already sorted and filtered
  filtered: boolean; // filters are hiding some of its pieces
  zoom: Zoom;
  onOpenFolder: (id: string | undefined) => void;
  onOpenItem: (id: string) => void;
  onPreview: (id: string | null, anchor?: HTMLElement) => void;
  onClearFilters: () => void;
};

type Mode = "new" | "rename" | "delete" | null;

// The FOLDERS view (PRODUCT.md Milestone 12). A path row on top
// ("FOLDERS / SEASONS / SUMMER": earlier parts go back up), with + NEW FOLDER
// and, inside a folder, RENAME · DELETE. Then one grid: the folders inside
// first, then the pieces added to this folder directly.
export default function FolderView({
  folders,
  items,
  folderId,
  pieces,
  filtered,
  zoom,
  onOpenFolder,
  onOpenItem,
  onPreview,
  onClearFilters,
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
            <>
              <button type="button" onClick={() => setMode("rename")} className={action}>
                Rename
              </button>
              <button type="button" onClick={() => setMode("delete")} className={action}>
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {mode === "new" && (
        <FolderNameForm
          submitLabel="Create"
          onCancel={() => setMode(null)}
          onSubmit={async (name) => {
            await createFolder(name, current?.id);
            setMode(null);
            router.refresh();
          }}
        />
      )}
      {mode === "rename" && current && (
        <FolderNameForm
          initialName={current.name}
          submitLabel="Rename"
          onCancel={() => setMode(null)}
          onSubmit={async (name) => {
            await renameFolder(current.id, name);
            setMode(null);
            router.refresh();
          }}
        />
      )}
      {mode === "delete" && current && (
        <FolderDeleteConfirm
          name={current.name}
          foldersInside={countFoldersInside(folders, current.id)}
          onKeep={() => setMode(null)}
          onDelete={async () => {
            await deleteFolder(current.id);
            setMode(null);
            onOpenFolder(current.parentId); // back up to where it was
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
      ) : filtered ? (
        <ViewEmpty message="No pieces match these filters." action={{ label: "Clear filters", onClick: onClearFilters }} />
      ) : current ? (
        <ViewEmpty message="This folder is empty. Add pieces to it from their details." />
      ) : (
        mode !== "new" && (
          <ViewEmpty
            message="No folders yet. Make one for a collection: grails, a season, pieces to sell."
            action={{ label: "+ New folder", onClick: () => setMode("new") }}
          />
        )
      )}
    </>
  );
}
