"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ArchiveForm from "@/components/ArchiveForm";
import DeleteConfirm from "@/components/DeleteConfirm";
import { createClient } from "@/lib/supabase/client";
import type { Item } from "@/lib/types";

const actionClass = "cursor-pointer text-label uppercase underline underline-offset-4 disabled:cursor-wait";

// The owner's actions in the overlay panel, under the item's name:
// Edit, Archive / Un-archive, and (quieter, set apart) Delete.
export default function ItemActions({ item }: { item: Item }) {
  const router = useRouter();
  const [archiving, setArchiving] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const archived = item.status === "archived";

  // Un-archiving is fully reversible, so it happens straight away. It clears
  // when and how the piece left.
  async function unarchive() {
    setBusy(true);
    setArchiving(false);
    await createClient()
      .from("items")
      .update({ status: "in_closet", archived_month: null, archived_year: null, left_via: null })
      .eq("id", item.id);
    router.refresh();
    setBusy(false);
  }

  if (confirmingDelete) {
    return <DeleteConfirm item={item} onKeep={() => setConfirmingDelete(false)} />;
  }

  return (
    <>
      <div className="mt-4 flex gap-6">
        <Link href={`/items/${item.id}/edit`} className={actionClass}>
          Edit
        </Link>
        {archived ? (
          <button type="button" onClick={unarchive} disabled={busy} className={actionClass}>
            {busy ? "Un-archiving…" : "Un-archive"}
          </button>
        ) : (
          !archiving && (
            <button type="button" onClick={() => setArchiving(true)} className={actionClass}>
              Archive
            </button>
          )
        )}
        <button
          type="button"
          onClick={() => {
            setArchiving(false);
            setConfirmingDelete(true);
          }}
          className="ml-auto cursor-pointer text-label text-stone uppercase underline-offset-4 hover:underline"
        >
          Delete
        </button>
      </div>
      {archiving && !archived && <ArchiveForm item={item} onCancel={() => setArchiving(false)} />}
    </>
  );
}
