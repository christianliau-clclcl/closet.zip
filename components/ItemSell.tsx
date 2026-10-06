"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Chip from "@/components/Chip";
import ChipPicker from "@/components/ChipPicker";
import FormField from "@/components/FormField";
import { formatPrice } from "@/lib/format";
import { MAX_SALE_NOTE, conditionLabels, conditions, missingForListing, type Condition } from "@/lib/listing";
import { listPiece, markSold, unlistPiece } from "@/lib/listing-client";
import type { Item } from "@/lib/types";

// The For sale section in the detail panel (your own pieces in the closet,
// Milestone 16b). FOR SALE · OFF / ON; ON opens the listing: asking price,
// condition and an optional note, after checking the piece has its size and
// measurements (required for listings). Listed: the price and condition,
// EDIT LISTING and MARK SOLD (off sale and archived as Sold). OFF takes it
// off sale, keeping the listing for next time.
export default function ItemSell({ item }: { item: Item }) {
  const router = useRouter();
  const listed = Boolean(item.listing);
  const [editing, setEditing] = useState(false);
  // The current listing, or an earlier one kept after taking it off sale.
  const start = item.listing ?? item.lastListing;
  const [price, setPrice] = useState(start?.askingPrice !== undefined ? String(start.askingPrice) : "");
  const [condition, setCondition] = useState<Condition | "">(start?.condition ?? "");
  const [note, setNote] = useState(start?.note ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const missing = missingForListing(item);

  const action = "cursor-pointer text-label uppercase underline underline-offset-4 disabled:cursor-wait";

  async function run(change: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await change();
      setEditing(false);
      router.refresh();
    } catch {
      setError("Couldn't save. Check your connection and try again.");
    }
    setBusy(false);
  }

  function list() {
    const askingPrice = Number(price.replace(/[$,\s]/g, ""));
    if (!price.trim() || !Number.isFinite(askingPrice) || askingPrice < 0) {
      return setError("Add an asking price, e.g. 120.");
    }
    if (!condition) return setError("Choose its condition.");
    run(() => listPiece(item.id, { askingPrice, condition, note }));
  }

  return (
    <section className="mt-8">
      <h3 className="text-label text-stone uppercase">For sale</h3>
      <div className="mt-2 flex gap-2">
        <Chip
          chosen={!listed && !editing}
          onClick={() => {
            setEditing(false);
            setError(null);
            if (listed) run(() => unlistPiece(item.id));
          }}
        >
          Off
        </Chip>
        <Chip chosen={listed || editing} onClick={() => !listed && setEditing(true)}>
          On
        </Chip>
      </div>

      {listed && !editing && item.listing && (
        <div className="mt-4">
          <p>
            {formatPrice(item.listing.askingPrice)} · {conditionLabels[item.listing.condition]}
          </p>
          {item.listing.note && <p className="mt-1 text-stone">{item.listing.note}</p>}
          <div className="mt-4 flex gap-6">
            <button type="button" onClick={() => setEditing(true)} disabled={busy} className={action}>
              Edit listing
            </button>
            <button type="button" onClick={() => run(() => markSold(item.id))} disabled={busy} className={action}>
              {busy ? "Saving…" : "Mark sold"}
            </button>
          </div>
        </div>
      )}

      {editing &&
        (missing.length > 0 ? (
          <div className="mt-4 border-y border-rule py-4">
            <p className="text-stone">Before you can list it, add: {missing.join(", ")}.</p>
            <div className="mt-4 flex gap-6">
              <Link href={`/items/${item.id}/edit`} className={action}>
                Edit details →
              </Link>
              <button type="button" onClick={() => setEditing(false)} className="cursor-pointer text-label uppercase">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-6 border-y border-rule py-6">
            <FormField
              label="Asking price"
              inputMode="decimal"
              placeholder="e.g. 120"
              hint={item.price !== undefined ? `You paid ${formatPrice(item.price)}. Only you see that.` : undefined}
              value={price}
              onChange={(event) => setPrice(event.target.value)}
            />
            <ChipPicker
              legend="Condition"
              options={conditions}
              labelFor={(option) => conditionLabels[option]}
              value={condition}
              onChange={setCondition}
            />
            <FormField
              label="Sale note (optional)"
              placeholder="e.g. Worn twice, slight fade on the collar"
              maxLength={MAX_SALE_NOTE}
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
            <div className="flex items-center gap-6">
              <button
                type="button"
                onClick={list}
                disabled={busy}
                className="cursor-pointer bg-ink px-5 py-3 font-medium text-cell disabled:cursor-wait"
              >
                {busy ? "Saving…" : listed ? "Save listing" : "List it"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setError(null);
                }}
                className="cursor-pointer text-label uppercase"
              >
                Cancel
              </button>
            </div>
            {item.hidden && <p className="text-stone">Listing it also shows it on your public page.</p>}
          </div>
        ))}

      {error && (
        <p role="alert" className="mt-4">
          {error}
        </p>
      )}
    </section>
  );
}
