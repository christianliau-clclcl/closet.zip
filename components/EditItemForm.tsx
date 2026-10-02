"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ItemDetailsFields from "@/components/ItemDetailsFields";
import { detectColour, loadImageFromUrl } from "@/lib/colour";
import { convertDraftMeasurements, draftToRow, itemToDraft, type ItemDraft } from "@/lib/item-draft";
import type { ClosetHistory } from "@/lib/items";
import type { Unit } from "@/lib/measurements";
import { saveMyUnit } from "@/lib/profile-client";
import { createClient } from "@/lib/supabase/client";
import type { Item } from "@/lib/types";

type EditItemFormProps = {
  item: Item;
  history: ClosetHistory; // your brands, materials and usual sizes
  initialUnit: Unit;
};

// Edit an item's details (the same fields as Add, already filled in).
// Saving returns to the closet with this item's overlay open.
export default function EditItemForm({ item, history, initialUnit }: EditItemFormProps) {
  const router = useRouter();
  const [unit, setUnit] = useState<Unit>(initialUnit);
  const [draft, setDraft] = useState<ItemDraft>(() => itemToDraft(item, initialUnit));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pieces saved before colours existed: detect from the cover photo once,
  // shown in the form and saved with the next Save. Never replaces a colour.
  useEffect(() => {
    if (item.colourHex) return;
    let current = true;
    loadImageFromUrl(item.hero.src)
      .then(detectColour)
      .catch(() => null)
      .then((hex) => {
        if (current && hex) setDraft((d) => (d.colourHex ? d : { ...d, colourHex: hex }));
      });
    return () => {
      current = false;
    };
  }, [item.colourHex, item.hero.src]);

  // Switching units converts what's already typed and remembers the choice.
  function changeUnit(next: Unit) {
    setDraft((d) => ({ ...d, measurements: convertDraftMeasurements(d.measurements, unit, next) }));
    setUnit(next);
    saveMyUnit(next);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const checked = draftToRow(draft, unit, item.measurements);
    if ("error" in checked) {
      setError(checked.error);
      return;
    }

    setBusy(true);
    setError(null);
    const { error } = await createClient().from("items").update(checked.row).eq("id", item.id);
    if (error) {
      setError("Couldn't save. Check your connection and try again.");
      setBusy(false);
      return;
    }
    router.push(`/?item=${item.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <ItemDetailsFields
        draft={draft}
        onChange={setDraft}
        photoSrc={item.hero.src}
        history={history}
        unit={unit}
        onUnitChange={changeUnit}
      />
      <div>
        {error && (
          <p role="alert" className="mb-4">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={busy}
          className="w-full cursor-pointer bg-ink px-5 py-3 font-medium text-cell disabled:cursor-wait"
        >
          {busy ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
