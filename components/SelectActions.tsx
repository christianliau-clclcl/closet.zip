"use client";

import FolderPicker from "@/components/FolderPicker";
import type { Folder } from "@/lib/types";

type SelectActionsProps = {
  count: number; // pieces selected
  folders: Folder[];
  inFolder: boolean; // REMOVE FROM FOLDER only makes sense inside one
  allHidden: boolean; // every chosen piece is hidden: SHOW instead of HIDE
  opensUp: boolean; // in the phone's bottom bar
  onAdd: (folderId: string) => Promise<void>;
  onCreate: (name: string) => Promise<void>;
  onRemove: () => Promise<void>;
  onHide: (hidden: boolean) => Promise<void>;
  onDone: () => void;
};

// The bar's contents in SELECT mode (Milestone 12d): how many are chosen,
// ADD TO FOLDER, REMOVE FROM FOLDER (inside a folder), HIDE / SHOW on your
// public page (15b: SHOW when every chosen piece is already hidden), and
// DONE to leave.
// The view bar shows it on desktop, the bottom bar on phones.
export default function SelectActions({
  count,
  folders,
  inFolder,
  allHidden,
  opensUp,
  onAdd,
  onCreate,
  onRemove,
  onHide,
  onDone,
}: SelectActionsProps) {
  const action = "cursor-pointer text-label whitespace-nowrap uppercase disabled:cursor-default disabled:text-pebble";

  return (
    <>
      <span className="text-label whitespace-nowrap text-stone uppercase" aria-live="polite">
        {count} selected
      </span>
      <FolderPicker folders={folders} disabled={count === 0} opensUp={opensUp} onPick={onAdd} onCreate={onCreate} />
      {inFolder && (
        <button type="button" onClick={onRemove} disabled={count === 0} className={action}>
          Remove
        </button>
      )}
      <button
        type="button"
        onClick={() => onHide(!allHidden)}
        disabled={count === 0}
        className={action}
        aria-label={allHidden ? "Show on your public page" : "Hide from your public page"}
      >
        {allHidden ? "Show" : "Hide"}
      </button>
      <button type="button" onClick={onDone} className={action}>
        Done
      </button>
    </>
  );
}
