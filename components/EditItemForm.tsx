"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import ItemDetailsFields from "@/components/ItemDetailsFields";
import { draftToRow, itemToDraft, type ItemDraft } from "@/lib/item-draft";
import { createClient } from "@/lib/supabase/client";
import type { Item } from "@/lib/types";

type EditItemFormProps = {
  item: Item;
  brandSuggestions: string[];
};

// Edit an item's details (the same fields as Add, already filled in).
// Saving returns to the closet with this item's overlay open.
export default function EditItemForm({ item, brandSuggestions }: EditItemFormProps) {
  const router = useRouter();
  const [draft, setDraft] = useState<ItemDraft>(() => itemToDraft(item));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const checked = draftToRow(draft);
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
      <ItemDetailsFields draft={draft} onChange={setDraft} brandSuggestions={brandSuggestions} />
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
