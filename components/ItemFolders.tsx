"use client";

import { useState } from "react";
import FolderChecklist from "@/components/FolderChecklist";
import { folderPath, foldersContaining } from "@/lib/folder-tree";
import type { Folder } from "@/lib/types";

type ItemFoldersProps = {
  itemId: string;
  folders: Folder[];
  onOpenFolder: (id: string) => void;
};

// The Folders section at the end of the detail panel (your own pieces only):
// the folders this piece is in, each a link that opens it ("Seasons / Summer"
// for one inside another). EDIT turns the list into a checklist of every folder.
export default function ItemFolders({ itemId, folders, onOpenFolder }: ItemFoldersProps) {
  const [editing, setEditing] = useState(false);
  const containing = foldersContaining(folders, itemId);

  const action = "cursor-pointer text-label uppercase underline-offset-4 hover:underline";

  return (
    <section className="mt-8">
      <div className="flex items-baseline justify-between">
        <h3 className="text-label text-stone uppercase">Folders</h3>
        {(editing || containing.length > 0) && (
          <button type="button" aria-expanded={editing} onClick={() => setEditing(!editing)} className={action}>
            {editing ? "Done" : "Edit"}
          </button>
        )}
      </div>

      {editing ? (
        <FolderChecklist itemId={itemId} folders={folders} />
      ) : containing.length > 0 ? (
        <ul className="mt-2 border-t border-rule">
          {containing.map((folder) => (
            <li key={folder.id} className="border-b border-rule py-2">
              <button
                type="button"
                onClick={() => onOpenFolder(folder.id)}
                className="cursor-pointer text-left underline-offset-4 hover:underline"
              >
                {folderPath(folders, folder.id)
                  .map((f) => f.name)
                  .join(" / ")}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-2 flex items-baseline justify-between gap-4 border-y border-rule py-2">
          <p className="text-stone">Not in any folder.</p>
          <button type="button" onClick={() => setEditing(true)} className={`${action} shrink-0`}>
            Add to folder
          </button>
        </div>
      )}
    </section>
  );
}
