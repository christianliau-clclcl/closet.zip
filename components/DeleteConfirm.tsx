"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Item } from "@/lib/types";

type DeleteConfirmProps = {
  item: Item;
  onKeep: () => void;
};

// Replaces the actions row when you press Delete. Deleting is permanent
// (unlike archiving), so it asks first.
export default function DeleteConfirm({ item, onKeep }: DeleteConfirmProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function deleteItem() {
    setBusy(true);
    setError(null);
    const supabase = createClient();

    // 1. Find the photo files before their records go.
    const { data: photos, error: photosError } = await supabase
      .from("item_photos")
      .select("storage_path, thumb_path")
      .eq("item_id", item.id);
    if (photosError) return fail();

    // 2. Delete the item; the database removes its photo records with it.
    const { error: deleteError } = await supabase.from("items").delete().eq("id", item.id);
    if (deleteError) return fail();

    // 3. Delete the files. If this fails, the item is still gone; at worst a
    //    few unseen files are left in storage.
    const paths = photos.flatMap((p) => [p.storage_path, p.thumb_path]).filter((p): p is string => Boolean(p));
    if (paths.length > 0) await supabase.storage.from("item-photos").remove(paths);

    // 4. Close the overlay and show the closet without it.
    router.replace("/");
    router.refresh();
  }

  function fail() {
    setError("Couldn't delete. Check your connection and try again.");
    setBusy(false);
  }

  return (
    <div role="alertdialog" aria-label="Delete this piece" className="mt-4 border-y border-rule py-4">
      <p>Delete this piece permanently? Its photos and details can&apos;t be recovered.</p>
      {error && (
        <p role="alert" className="mt-4">
          {error}
        </p>
      )}
      <div className="mt-4 flex items-center gap-6">
        <button
          type="button"
          onClick={deleteItem}
          disabled={busy}
          className="cursor-pointer bg-ink px-5 py-3 font-medium text-cell disabled:cursor-wait"
        >
          {busy ? "Deleting…" : "Delete"}
        </button>
        <button type="button" onClick={onKeep} disabled={busy} className="cursor-pointer text-label uppercase">
          Keep
        </button>
      </div>
    </div>
  );
}
