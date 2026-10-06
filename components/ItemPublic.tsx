"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Chip from "@/components/Chip";
import { setPiecesHidden } from "@/lib/hiding-client";
import type { Item } from "@/lib/types";

// The Public page section in the detail panel (your own pieces only,
// Milestone 15b): SHOWN · HIDDEN, saved as soon as you tap. Hiding leaves the
// piece out of your public page; your own closet doesn't change, apart from
// a small mark on its cell.
export default function ItemPublic({ item }: { item: Item }) {
  const router = useRouter();
  // Changes straight away; goes back if saving fails.
  const [hidden, setHidden] = useState(Boolean(item.hidden));
  const [error, setError] = useState(false);

  async function choose(next: boolean) {
    if (next === hidden) return;
    setHidden(next);
    setError(false);
    try {
      await setPiecesHidden([item.id], next);
      router.refresh();
    } catch {
      setHidden(!next);
      setError(true);
    }
  }

  return (
    <section className="mt-8">
      <h3 className="text-label text-stone uppercase">Public page</h3>
      <div className="mt-2 flex gap-2">
        <Chip chosen={!hidden} onClick={() => choose(false)}>
          Shown
        </Chip>
        <Chip chosen={hidden} onClick={() => choose(true)}>
          Hidden
        </Chip>
      </div>
      {item.listing && !hidden && <p className="mt-2 text-stone">Hiding it takes it off sale.</p>}
      {error && (
        <p role="alert" className="mt-2">
          Couldn&rsquo;t save. Check your connection and try again.
        </p>
      )}
    </section>
  );
}
