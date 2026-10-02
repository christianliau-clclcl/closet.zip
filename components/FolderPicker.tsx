"use client";

import { useState } from "react";
import FolderNameForm from "@/components/FolderNameForm";
import { folderTree } from "@/lib/folder-tree";
import { usePopover } from "@/lib/use-popover";
import type { Folder } from "@/lib/types";

type FolderPickerProps = {
  folders: Folder[];
  disabled: boolean; // nothing selected yet
  opensUp: boolean; // in the phone's bottom bar
  onPick: (folderId: string) => Promise<void>;
  onCreate: (name: string) => Promise<void>; // a new top-level folder, then add to it
};

// ADD TO FOLDER in SELECT mode: a small list of every folder (folders inside
// folders indented) plus + NEW FOLDER. Choosing one adds the selected pieces.
// Closes on Esc or a tap anywhere else, like the SORT list.
export default function FolderPicker({ folders, disabled, opensUp, onPick, onCreate }: FolderPickerProps) {
  const { open, setOpen, wrapper } = usePopover();
  const [naming, setNaming] = useState(false);

  return (
    <div ref={wrapper} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        disabled={disabled}
        onClick={() => {
          setOpen(!open);
          setNaming(false);
        }}
        className="cursor-pointer text-label whitespace-nowrap uppercase disabled:cursor-default disabled:text-pebble"
      >
        Add to folder
      </button>
      {open && (
        <div
          className={`absolute z-20 max-h-80 w-64 overflow-y-auto border border-rule bg-cell py-2 ${
            opensUp ? "bottom-full left-0 mb-3" : "top-full right-0 mt-3"
          }`}
        >
          {folderTree(folders).map(({ folder, depth }) => (
            <button
              key={folder.id}
              type="button"
              onClick={async () => {
                setOpen(false);
                await onPick(folder.id);
              }}
              // 16px further in for each level, after the usual 16px.
              style={{ paddingLeft: 16 + depth * 16 }}
              className="block w-full cursor-pointer truncate py-2 pr-4 text-left hover:underline"
            >
              {folder.name}
            </button>
          ))}
          <div className="px-4 pt-2">
            {naming ? (
              <FolderNameForm
                submitLabel="Create"
                onCancel={() => setNaming(false)}
                onSubmit={async (name) => {
                  await onCreate(name);
                  setOpen(false);
                }}
              />
            ) : (
              <button
                type="button"
                onClick={() => setNaming(true)}
                className="cursor-pointer py-2 text-label uppercase underline-offset-4 hover:underline"
              >
                + New folder
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
