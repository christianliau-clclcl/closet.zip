"use client";

import { useEffect, useId, useRef, useState } from "react";
import CoverChooser from "@/components/CoverChooser";
import FolderDeleteConfirm from "@/components/FolderDeleteConfirm";
import FormField from "@/components/FormField";
import { MAX_FOLDER_NAME, countFoldersInside, folderAndInside, moveTargets } from "@/lib/folder-tree";
import { deleteFolder, saveFolder, type CoverChoice } from "@/lib/folders-client";
import { UnreadableImage } from "@/lib/photos";
import type { Folder, Item } from "@/lib/types";

type FolderModalProps = {
  folder?: Folder; // editing this one; none for + NEW FOLDER
  parentId?: string; // where a new folder starts out (the open folder)
  pieces: Item[]; // the folder's own pieces, for a piece cover
  folders: Folder[]; // all of them, for what a delete takes with it
  onClose: () => void;
  onSaved: () => void;
  onDeleted: () => void;
};

// The folder modal (PRODUCT.md Milestone 12e) for + NEW FOLDER and EDIT:
// name, cover (box, image or piece) and, when editing, DELETE. Phones: a
// full-screen page like the filter drawer. Desktop: a 384px panel in the
// middle over the scrim. A native <dialog>: Esc and focus are handled.
// Mounted only while open, so it always starts from the saved folder.
export default function FolderModal({ folder, parentId, pieces, folders, onClose, onSaved, onDeleted }: FolderModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const insideId = useId();
  const [name, setName] = useState(folder?.name ?? "");
  // INSIDE: the folder this one sits in ("" = the top level).
  const [inside, setInside] = useState(folder ? (folder.parentId ?? "") : (parentId ?? ""));
  const [cover, setCover] = useState<CoverChoice>(() =>
    folder?.coverPath
      ? { kind: "current-image" }
      : folder?.coverItemId && pieces.some((p) => p.id === folder.coverItemId)
        ? { kind: "piece", itemId: folder.coverItemId }
        : { kind: "box" },
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    // Opening moves focus to the first button (✕); a new folder starts typing.
    if (!folder) dialog?.querySelector<HTMLInputElement>("input")?.focus();
  }, [folder]);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) {
      setError("Give the folder a name.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await saveFolder({ id: folder?.id, name, parentId: inside || undefined, cover, currentCoverPath: folder?.coverPath });
      onSaved();
    } catch (cause) {
      setError(
        cause instanceof UnreadableImage
          ? "That file couldn't be opened as an image. Try a PNG, JPEG or WebP."
          : "Couldn't save. Check your connection and try again.",
      );
      setBusy(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-label={folder ? "Edit folder" : "New folder"}
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onClose();
      }}
      className="m-0 h-dvh max-h-none w-full max-w-none flex-col bg-cell p-0 outline-none open:flex backdrop:bg-transparent md:m-auto md:h-auto md:max-h-[85dvh] md:max-w-sm md:backdrop:bg-scrim md:backdrop:backdrop-blur-md"
    >
      <form onSubmit={save} className="flex min-h-0 flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-rule px-4 py-3 md:px-8">
          <h2 className="text-label uppercase">{folder ? "Edit folder" : "New folder"}</h2>
          <button type="button" onClick={onClose} disabled={busy} aria-label="Close" className="cursor-pointer">
            ✕
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-8 overflow-y-auto px-4 py-6 md:px-8">
          <FormField
            label="Name"
            value={name}
            maxLength={MAX_FOLDER_NAME}
            onChange={(event) => setName(event.target.value)}
          />
          <div>
            <label htmlFor={insideId} className="text-label uppercase">
              Inside
            </label>
            <div className="relative mt-2">
              {/* The phone's own picker; folders inside folders are indented. */}
              <select
                id={insideId}
                value={inside}
                onChange={(event) => setInside(event.target.value)}
                className="w-full appearance-none border border-rule bg-cell px-3 py-3 pr-8 outline-none focus:border-ink"
              >
                <option value="">Folders (top level)</option>
                {moveTargets(folders, folder?.id).map(({ folder: target, depth }) => (
                  <option key={target.id} value={target.id}>
                    {"\u00a0\u00a0\u00a0".repeat(depth + 1)}
                    {target.name}
                  </option>
                ))}
              </select>
              <span aria-hidden className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-stone">
                ▾
              </span>
            </div>
          </div>
          <CoverChooser value={cover} onChange={setCover} pieces={pieces} currentImageSrc={folder?.coverSrc} />

          {folder &&
            (confirmingDelete ? (
              <FolderDeleteConfirm
                name={folder.name}
                foldersInside={countFoldersInside(folders, folder.id)}
                onKeep={() => setConfirmingDelete(false)}
                onDelete={async () => {
                  const coverPaths = folderAndInside(folders, folder.id).flatMap((f) => f.coverPath ?? []);
                  await deleteFolder(folder.id, coverPaths);
                  onDeleted();
                }}
              />
            ) : (
              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                className="cursor-pointer self-start text-label text-stone uppercase underline-offset-4 hover:underline"
              >
                Delete folder
              </button>
            ))}
        </div>

        <div className="border-t border-rule px-4 py-4 md:px-8">
          {error && (
            <p role="alert" className="mb-4">
              {error}
            </p>
          )}
          <button type="submit" disabled={busy} className="w-full cursor-pointer bg-ink px-5 py-3 font-medium text-cell disabled:cursor-wait">
            {busy ? "Saving…" : folder ? "Save" : "Create folder"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
