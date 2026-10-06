import Link from "next/link";
import type { Look } from "@/lib/types";

// The Looks section at the end of the detail panel (your own pieces,
// Milestone 17b): the looks this piece is in, each a link to it. Only shown
// when there's at least one, to keep the panel short.
export default function ItemLooks({ itemId, looks }: { itemId: string; looks: Look[] }) {
  const containing = looks.filter((look) => look.pieces.some((piece) => piece.itemId === itemId));
  if (containing.length === 0) return null;

  return (
    <section className="mt-8">
      <h3 className="text-label text-stone uppercase">Looks</h3>
      <ul className="mt-2 border-t border-rule">
        {containing.map((look) => (
          <li key={look.id} className="border-b border-rule py-2">
            <Link href={`/looks/${look.id}`} className="underline-offset-4 hover:underline">
              {look.name}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
