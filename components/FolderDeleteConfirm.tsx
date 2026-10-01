"use client";

import { useState } from "react";

type FolderDeleteConfirmProps = {
  name: string;
  foldersInside: number; // deleted with it, at any depth
  onDelete: () => Promise<void>;
  onKeep: () => void;
};

// Asks before deleting a folder, saying exactly what goes: the folder and the
// folders inside it. Pieces are never deleted (PRODUCT.md Milestone 12).
export default function FolderDeleteConfirm({ name, foldersInside, onDelete, onKeep }: FolderDeleteConfirmProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirm() {
    setBusy(true);
    setError(null);
    try {
      await onDelete();
    } catch {
      setError("Couldn't delete. Check your connection and try again.");
      setBusy(false);
    }
  }

  const inside =
    foldersInside === 0 ? "" : ` and the ${foldersInside === 1 ? "folder" : `${foldersInside} folders`} inside it`;

  return (
    <div role="alertdialog" aria-label="Delete this folder" className="mb-8 max-w-sm border-y border-rule py-4">
      <p>
        Delete “{name}”{inside}? The pieces in {foldersInside === 0 ? "it" : "them"} stay in your closet.
      </p>
      {error && (
        <p role="alert" className="mt-4">
          {error}
        </p>
      )}
      <div className="mt-4 flex items-center gap-6">
        <button type="button" onClick={confirm} disabled={busy} className="cursor-pointer bg-ink px-5 py-3 font-medium text-cell disabled:cursor-wait">
          {busy ? "Deleting…" : "Delete"}
        </button>
        <button type="button" onClick={onKeep} disabled={busy} className="cursor-pointer text-label uppercase">
          Keep
        </button>
      </div>
    </div>
  );
}
