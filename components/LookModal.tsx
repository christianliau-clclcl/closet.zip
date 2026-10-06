"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import FormField from "@/components/FormField";
import { MAX_LOOK_NAME, MAX_LOOK_NOTE, deleteLook, updateLook } from "@/lib/looks-client";
import type { Look } from "@/lib/types";

type LookModalProps = {
  look: Look;
  onClose: () => void;
};

// EDIT on a look's page (Milestone 17b): its name, note and, set apart,
// DELETE LOOK (with a confirm; the pieces themselves stay). Same shape as
// the folder modal: full screen on phones, a 384px panel over the scrim on
// desktop. A native <dialog>: Esc and focus are handled.
export default function LookModal({ look, onClose }: LookModalProps) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const noteId = useId();
  const [name, setName] = useState(look.name);
  const [note, setNote] = useState(look.note ?? "");
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) return setError("Give the look a name.");
    setBusy(true);
    setError(null);
    try {
      await updateLook(look.id, name, note);
      onClose();
      router.refresh();
    } catch {
      setError("Couldn't save. Check your connection and try again.");
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    try {
      await deleteLook(look.id);
      router.replace("/?view=looks");
      router.refresh();
    } catch {
      setError("Couldn't delete. Check your connection and try again.");
      setBusy(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-label="Edit look"
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onClose();
      }}
      className="m-0 h-dvh max-h-none w-full max-w-none flex-col bg-cell p-0 outline-none open:flex backdrop:bg-transparent md:m-auto md:h-auto md:max-w-sm md:backdrop:bg-scrim md:backdrop:backdrop-blur-md"
    >
      <form onSubmit={save} className="flex flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-rule px-4 py-3 md:px-8">
          <h2 className="text-label uppercase">Edit look</h2>
          <button type="button" onClick={onClose} disabled={busy} aria-label="Close" className="cursor-pointer">
            ✕
          </button>
        </div>
        <div className="flex flex-1 flex-col gap-8 px-4 py-6 md:px-8">
          <FormField label="Name" maxLength={MAX_LOOK_NAME} value={name} onChange={(event) => setName(event.target.value)} />
          <div>
            <label htmlFor={noteId} className="text-label uppercase">
              Note (optional)
            </label>
            <textarea
              id={noteId}
              rows={4}
              maxLength={MAX_LOOK_NOTE}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              className="mt-2 w-full resize-y border border-rule bg-cell px-3 py-3 font-serif text-notes outline-none focus:border-ink"
            />
          </div>
          {confirming ? (
            <div className="border-y border-rule py-4">
              <p>Delete “{look.name}”? The pieces stay in your closet.</p>
              <div className="mt-4 flex gap-6">
                <button
                  type="button"
                  onClick={remove}
                  disabled={busy}
                  className="cursor-pointer text-label uppercase underline underline-offset-4 disabled:cursor-wait"
                >
                  {busy ? "Deleting…" : "Delete look"}
                </button>
                <button type="button" onClick={() => setConfirming(false)} className="cursor-pointer text-label uppercase">
                  Keep it
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="cursor-pointer self-start text-label text-stone uppercase underline-offset-4 hover:underline"
            >
              Delete look
            </button>
          )}
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
