"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import FolderNameForm from "@/components/FolderNameForm";
import { folderTree } from "@/lib/folder-tree";
import { addToFolder, createFolder, removeFromFolder } from "@/lib/folders-client";
import type { Folder } from "@/lib/types";

type FolderChecklistProps = {
  itemId: string;
  folders: Folder[];
};

// Every folder as a checkbox row, folders inside folders indented. Ticking
// adds the piece, unticking removes it; each change saves straight away
// (the piece itself is never touched). + NEW FOLDER makes a top-level folder
// with the piece already in it.
export default function FolderChecklist({ itemId, folders }: FolderChecklistProps) {
  const router = useRouter();
  // Shown ticked straight away; the database catches up a moment later.
  const [chosen, setChosen] = useState(
    () => new Set(folders.filter((f) => f.itemIds.includes(itemId)).map((f) => f.id)),
  );
  const [naming, setNaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle(folderId: string) {
    const adding = !chosen.has(folderId);
    const update = (add: boolean) =>
      setChosen((current) => {
        const next = new Set(current);
        if (add) next.add(folderId);
        else next.delete(folderId);
        return next;
      });
    update(adding);
    setError(null);
    try {
      await (adding ? addToFolder(folderId, itemId) : removeFromFolder(folderId, itemId));
      router.refresh(); // folder counts and covers elsewhere
    } catch {
      update(!adding); // put the tick back as it was
      setError("Couldn't save. Check your connection and try again.");
    }
  }

  return (
    <div className="mt-2">
      <fieldset>
        <legend className="sr-only">Folders this piece is in</legend>
        {folders.length > 0 && (
          <div className="border-t border-rule">
            {folderTree(folders).map(({ folder, depth }) => (
              <label
                key={folder.id}
                className="flex cursor-pointer items-center gap-3 border-b border-rule py-3"
                // 16px further in for each level, so folders inside folders read as such.
                style={{ paddingLeft: depth * 16 }}
              >
                <input
                  type="checkbox"
                  checked={chosen.has(folder.id)}
                  onChange={() => toggle(folder.id)}
                  className="size-4 accent-ink"
                />
                <span className="truncate">{folder.name}</span>
              </label>
            ))}
          </div>
        )}
      </fieldset>

      {error && (
        <p role="alert" className="mt-4">
          {error}
        </p>
      )}

      {naming ? (
        <div className="mt-4">
          <FolderNameForm
            submitLabel="Create"
            onCancel={() => setNaming(false)}
            onSubmit={async (name) => {
              const id = await createFolder(name, undefined);
              await addToFolder(id, itemId);
              setChosen((current) => new Set(current).add(id));
              setNaming(false);
              router.refresh();
            }}
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setNaming(true)}
          className="mt-4 cursor-pointer text-label uppercase underline-offset-4 hover:underline"
        >
          + New folder
        </button>
      )}
    </div>
  );
}
