"use client";

import { useState } from "react";
import FormField from "@/components/FormField";
import { MAX_FOLDER_NAME } from "@/lib/folder-tree";

type FolderNameFormProps = {
  initialName?: string;
  submitLabel: string; // "Create" or "Rename"
  onSubmit: (name: string) => Promise<void>;
  onCancel: () => void;
};

// The small inline form for naming a folder, under the folder path: used for
// + NEW FOLDER and RENAME.
export default function FolderNameForm({ initialName = "", submitLabel, onSubmit, onCancel }: FolderNameFormProps) {
  const [name, setName] = useState(initialName);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) {
      setError("Give the folder a name.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onSubmit(name);
    } catch {
      setError("Couldn't save. Check your connection and try again.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-8 max-w-sm border-y border-rule py-4">
      <FormField
        label="Folder name"
        value={name}
        maxLength={MAX_FOLDER_NAME}
        autoFocus
        onChange={(event) => setName(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") onCancel();
        }}
      />
      {error && (
        <p role="alert" className="mt-4">
          {error}
        </p>
      )}
      <div className="mt-4 flex items-center gap-6">
        <button type="submit" disabled={busy} className="cursor-pointer bg-ink px-5 py-3 font-medium text-cell disabled:cursor-wait">
          {busy ? "Saving…" : submitLabel}
        </button>
        <button type="button" onClick={onCancel} disabled={busy} className="cursor-pointer text-label uppercase">
          Cancel
        </button>
      </div>
    </form>
  );
}
