"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import FormField from "@/components/FormField";
import ItemGrid from "@/components/ItemGrid";
import { autoLayout } from "@/lib/look-layout";
import { MAX_LOOK_NAME, MAX_LOOK_NOTE, createLook } from "@/lib/looks-client";
import { SelectionContext } from "@/lib/selection";
import type { Item } from "@/lib/types";

// + NEW LOOK (Milestone 17b): a name, an optional note, and the pieces,
// chosen by tapping them (the same select squares as SELECT). CREATE LOOK
// lays them out head to toe (lib/look-layout.ts) and opens the new look.
export default function NewLookForm({ items }: { items: Item[] }) {
  const router = useRouter();
  const noteId = useId();
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [chosen, setChosen] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggle(id: string) {
    setChosen((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function create() {
    if (!name.trim()) return setError("Give the look a name.");
    if (chosen.size === 0) return setError("Choose at least one piece.");
    setBusy(true);
    setError(null);
    try {
      // In the closet's order, so the layout is predictable.
      const pieces = items.filter((item) => chosen.has(item.id));
      const id = await createLook(name, note, autoLayout(pieces));
      router.push(`/looks/${id}`);
    } catch {
      setError("Couldn't save. Check your connection and try again.");
      setBusy(false);
    }
  }

  return (
    <>
      <main className="flex-1 px-4 pt-12 pb-32 md:px-8 md:pt-16">
        <div className="max-w-sm">
          <h1 className="font-serif text-title">New look</h1>
          <div className="mt-8 flex flex-col gap-6">
            <FormField
              label="Name"
              placeholder="e.g. Winter uniform"
              maxLength={MAX_LOOK_NAME}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <div>
              <label htmlFor={noteId} className="text-label uppercase">
                Note (optional)
              </label>
              <textarea
                id={noteId}
                rows={3}
                maxLength={MAX_LOOK_NOTE}
                placeholder="Where you wore it, what it was for."
                value={note}
                onChange={(event) => setNote(event.target.value)}
                className="mt-2 w-full resize-y border border-rule bg-cell px-3 py-3 font-serif text-notes outline-none placeholder:text-stone focus:border-ink"
              />
            </div>
          </div>
        </div>
        <h2 className="mt-12 mb-4 text-label uppercase">Pieces</h2>
        {/* Tapping a piece chooses it, as in SELECT mode. */}
        <SelectionContext.Provider value={{ active: true, selected: chosen, toggle }}>
          <ItemGrid items={items} zoom="medium" onOpen={toggle} onPreview={() => {}} />
        </SelectionContext.Provider>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-rule bg-canvas px-4 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))] md:px-8">
        {error && (
          <p role="alert" className="mb-3">
            {error}
          </p>
        )}
        <div className="flex items-center justify-between gap-4">
          <span className="text-label text-stone uppercase" aria-live="polite">
            {chosen.size} chosen
          </span>
          <button
            type="button"
            onClick={create}
            disabled={busy}
            className="cursor-pointer bg-ink px-5 py-3 font-medium text-cell disabled:cursor-wait"
          >
            {busy ? "Saving…" : "Create look"}
          </button>
        </div>
      </div>
    </>
  );
}
