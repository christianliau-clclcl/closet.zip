"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Chip from "@/components/Chip";
import FadeImage from "@/components/FadeImage";
import { itemSummary, itemTitle } from "@/lib/format";
import { autoLayout } from "@/lib/look-layout";
import { createLook } from "@/lib/looks-client";
import { choicesFor, partInfo, parts, shuffle, type Part, type Pick } from "@/lib/shuffle";
import type { Item } from "@/lib/types";

type ShuffleViewProps = {
  items: Item[];
  first: Pick; // picked on the server, so the page and the browser agree
};

// SHUFFLE (Milestone 17d; mockup on the "Looks explorations" canvas): one
// random top, bottom and pair of shoes from your closet, a row each with
// KEEP. SHUFFLE AGAIN re-picks the rest; SAVE AS LOOK saves them laid out
// head to toe and opens ARRANGE. A part with nothing to choose says so.
export default function ShuffleView({ items, first }: ShuffleViewProps) {
  const router = useRouter();
  const [pick, setPick] = useState<Pick>(first);
  const [kept, setKept] = useState<Set<Part>>(new Set());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const byId = new Map(items.map((item) => [item.id, item]));
  const picked = parts.flatMap((part) => (pick[part] && byId.get(pick[part]!) ? [byId.get(pick[part]!)!] : []));

  function toggleKeep(part: Part) {
    setKept((current) => {
      const next = new Set(current);
      if (next.has(part)) next.delete(part);
      else next.add(part);
      return next;
    });
  }

  async function save() {
    if (picked.length === 0) return;
    setBusy(true);
    setError(null);
    try {
      // "Shuffle, Oct 2026"; renamed with EDIT on the look.
      const name = `Shuffle, ${new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" })}`;
      const id = await createLook(name, "", autoLayout(picked));
      router.push(`/looks/${id}/arrange`);
    } catch {
      setError("Couldn't save. Check your connection and try again.");
      setBusy(false);
    }
  }

  return (
    <>
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pt-6 pb-32 md:pt-10">
        <Link href="/?view=looks" className="text-label text-stone uppercase underline-offset-4 hover:underline">
          ← Looks
        </Link>
        <h1 className="mt-6 font-serif text-title">Shuffle</h1>
        <p className="mt-2 text-stone">
          One of each, from what’s in your closet. Keep the ones you like and shuffle the rest.
        </p>

        <ul className="mt-6 border-t border-rule">
          {parts.map((part) => {
            const item = pick[part] ? byId.get(pick[part]!) : undefined;
            const choices = choicesFor(items, part).length;
            return (
              <li key={part} className="flex items-center gap-4 border-b border-rule py-3">
                <span className="w-16 shrink-0 text-label text-stone uppercase">{partInfo[part].label}</span>
                {item ? (
                  <>
                    <Link href={`/?item=${item.id}`} className="relative block size-36 shrink-0" aria-label={itemTitle(item)}>
                      <FadeImage
                        // A new key per piece, so each new photo fades in.
                        key={item.id}
                        src={item.hero.thumbSrc ?? item.hero.src}
                        alt=""
                        fill
                        sizes="144px"
                        unoptimized={item.hero.unoptimized}
                        className="object-contain"
                      />
                    </Link>
                    <span className="flex min-w-0 flex-1 flex-col items-end gap-2 text-right">
                      <span className="max-w-full truncate text-label uppercase">{item.name ?? itemSummary(item)}</span>
                      {/* Keeping only matters when there's another piece to shuffle to. */}
                      {choices > 1 && (
                        <Chip chosen={kept.has(part)} onClick={() => toggleKeep(part)}>
                          Keep
                        </Chip>
                      )}
                    </span>
                  </>
                ) : (
                  <span className="text-stone">{partInfo[part].none}</span>
                )}
              </li>
            );
          })}
        </ul>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-rule bg-canvas px-4 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))]">
        <div className="mx-auto max-w-lg">
          {error && (
            <p role="alert" className="mb-3">
              {error}
            </p>
          )}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setPick((current) => shuffle(items, current, kept))}
              disabled={busy}
              className="flex-1 cursor-pointer border border-ink bg-cell px-5 py-3 font-medium text-ink"
            >
              Shuffle again
            </button>
            <button
              type="button"
              onClick={save}
              disabled={busy || picked.length === 0}
              className="flex-1 cursor-pointer bg-ink px-5 py-3 font-medium text-cell disabled:cursor-default disabled:bg-pebble"
            >
              {busy ? "Saving…" : "Save as look"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
