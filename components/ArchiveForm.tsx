"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import MonthYearField from "@/components/MonthYearField";
import OptionPicker from "@/components/OptionPicker";
import { checkMonthYear } from "@/lib/item-draft";
import { createClient } from "@/lib/supabase/client";
import type { Item, LeftVia } from "@/lib/types";

const leftViaOptions: LeftVia[] = ["sold", "donated", "gifted", "lost", "other"];

type ArchiveFormProps = {
  item: Item;
  onCancel: () => void;
};

// Opens in the overlay panel when you press Archive: when the piece left
// (this month by default) and, optionally, how. Archiving only changes the
// item's status; it's never deleted.
export default function ArchiveForm({ item, onCancel }: ArchiveFormProps) {
  const router = useRouter();
  const now = new Date();
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [year, setYear] = useState(String(now.getFullYear()));
  const [leftVia, setLeftVia] = useState<LeftVia | "">("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function archive() {
    const dateError = checkMonthYear(month, year, "it left");
    if (dateError) return setError(dateError);

    setBusy(true);
    setError(null);
    const { error } = await createClient()
      .from("items")
      .update({
        status: "archived",
        for_sale: false, // an archived piece is no longer for sale (16)
        archived_month: month ? Number(month) : null,
        archived_year: year ? Number(year) : null,
        left_via: leftVia || null,
      })
      .eq("id", item.id);
    if (error) {
      setError("Couldn't archive. Check your connection and try again.");
      setBusy(false);
      return;
    }
    // Re-read the closet: the overlay stays open, now showing it as archived.
    router.refresh();
  }

  return (
    <section aria-label="Archive this piece" className="mt-6 flex flex-col gap-6 border-y border-rule py-6">
      <p className="text-stone">No longer in your closet? Archiving keeps it and its details.</p>
      <MonthYearField
        legend="Left"
        month={month}
        year={year}
        onMonthChange={setMonth}
        onYearChange={setYear}
      />
      <OptionPicker legend="How" options={leftViaOptions} value={leftVia} onChange={setLeftVia} />
      <div>
        {error && (
          <p role="alert" className="mb-4">
            {error}
          </p>
        )}
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={archive}
            disabled={busy}
            className="cursor-pointer bg-ink px-5 py-3 font-medium text-cell disabled:cursor-wait"
          >
            {busy ? "Archiving…" : "Archive"}
          </button>
          <button type="button" onClick={onCancel} className="cursor-pointer text-label uppercase">
            Cancel
          </button>
        </div>
      </div>
    </section>
  );
}
