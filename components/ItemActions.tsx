import Link from "next/link";
import type { Item } from "@/lib/types";

// The owner's actions in the overlay panel, under the item's name.
// Archive and delete join Edit in the next steps of Milestone 6.
export default function ItemActions({ item }: { item: Item }) {
  return (
    <div className="mt-4 flex gap-6">
      <Link href={`/items/${item.id}/edit`} className="text-label uppercase underline underline-offset-4">
        Edit
      </Link>
    </div>
  );
}
