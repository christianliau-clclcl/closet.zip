"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import FormField from "@/components/FormField";
import { MAX_CLOSET_NAME, checkClosetName, closetNameLength } from "@/lib/closet-name";
import { createClient } from "@/lib/supabase/client";

type ClosetNameModalProps = {
  current?: string; // the name it has now, if any
  onClose: () => void;
};

// Naming or renaming the closet, from MENU (friend feedback, 2026-10-02).
// Same shape as the folder modal: full screen on phones, a 384px panel over
// the scrim on desktop. Saving an empty name goes back to CLOSET.ZIP.
export default function ClosetNameModal({ current, onClose }: ClosetNameModalProps) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState(current ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    // Opening moves focus to the first button (✕); start in the field instead.
    dialog?.querySelector<HTMLInputElement>("input")?.focus();
  }, []);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    let checked: string | null;
    try {
      checked = checkClosetName(name);
    } catch (problem) {
      setError((problem as Error).message);
      return;
    }
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error: saveError } = await supabase.auth.updateUser({ data: { closet_name: checked } });
    if (saveError) {
      setError("Couldn't save. Check your connection and try again.");
      setBusy(false);
      return;
    }
    // The name travels in the login itself, so get a fresh one before redrawing.
    await supabase.auth.refreshSession();
    onClose();
    router.refresh();
  }

  return (
    <dialog
      ref={dialogRef}
      aria-label={current ? "Rename closet" : "Name your closet"}
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onClose();
      }}
      className="m-0 h-dvh max-h-none w-full max-w-none flex-col bg-cell p-0 outline-none open:flex backdrop:bg-transparent md:m-auto md:h-auto md:max-w-sm md:backdrop:bg-scrim md:backdrop:backdrop-blur-md"
    >
      <form onSubmit={save} className="flex flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-rule px-4 py-3 md:px-8">
          <h2 className="text-label uppercase">{current ? "Rename closet" : "Name your closet"}</h2>
          <button type="button" onClick={onClose} disabled={busy} aria-label="Close" className="cursor-pointer">
            ✕
          </button>
        </div>
        <div className="flex-1 px-4 py-6 md:px-8">
          <FormField
            label="Closet name"
            placeholder="e.g. Sam’s Closet"
            maxLength={MAX_CLOSET_NAME * 2}
            hint={`${closetNameLength(name)} of ${MAX_CLOSET_NAME}. Leave empty to show CLOSET.ZIP.`}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
        <div className="border-t border-rule px-4 py-4 md:px-8">
          {error && (
            <p role="alert" className="mb-4">
              {error}
            </p>
          )}
          <button type="submit" disabled={busy} className="w-full cursor-pointer bg-ink px-5 py-3 font-medium text-cell disabled:cursor-wait">
            {busy ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
