"use client";

import Link from "next/link";
import { useState } from "react";
import FadeImage from "@/components/FadeImage";
import LookBoard from "@/components/LookBoard";
import LookModal from "@/components/LookModal";
import { itemTitle } from "@/lib/format";
import type { Item, Look } from "@/lib/types";

type LookViewProps = {
  look: Look;
  items: Item[];
};

// A look's page (Milestone 17b): the name in the serif, the board, the note,
// and its pieces as small photos that open their details in your closet.
// ARRANGE opens the board's editor (17c); EDIT the name, note and delete.
export default function LookView({ look, items }: LookViewProps) {
  const [editing, setEditing] = useState(false);
  const byId = new Map(items.map((item) => [item.id, item]));
  const pieces = look.pieces.map((piece) => byId.get(piece.itemId)).filter((item): item is Item => Boolean(item));

  return (
    <main className="mx-auto w-full max-w-lg flex-1 px-4 pt-6 pb-16 md:pt-10">
      <div className="flex items-baseline justify-between gap-6">
        <Link href="/?view=looks" className="text-label text-stone uppercase underline-offset-4 hover:underline">
          ← Looks
        </Link>
        <div className="flex gap-6">
          {/* The board, freeform (17c). */}
          <Link href={`/looks/${look.id}/arrange`} className="text-label uppercase underline underline-offset-4">
            Arrange
          </Link>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="cursor-pointer text-label uppercase underline underline-offset-4"
          >
            Edit
          </button>
        </div>
      </div>
      <h1 className="mt-6 font-serif text-title">{look.name}</h1>
      <LookBoard pieces={look.pieces} items={byId} className="mt-6" />
      {look.note && <p className="mt-6 font-serif text-notes whitespace-pre-line">{look.note}</p>}

      <h2 className="mt-10 text-label text-stone uppercase">Pieces · {pieces.length}</h2>
      <ul className="mt-2 flex flex-wrap gap-2 border-t border-rule pt-2">
        {pieces.map((item) => (
          <li key={item.id}>
            <Link
              href={`/?item=${item.id}`}
              aria-label={itemTitle(item)}
              className="relative block size-16 focus-visible:outline-1 focus-visible:outline-ink"
            >
              <FadeImage
                src={item.hero.thumbSrc ?? item.hero.src}
                alt=""
                fill
                sizes="64px"
                unoptimized={item.hero.unoptimized}
                className="object-contain p-1"
              />
            </Link>
          </li>
        ))}
      </ul>

      {editing && <LookModal look={look} onClose={() => setEditing(false)} />}
    </main>
  );
}
