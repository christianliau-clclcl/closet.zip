import { colourFamily, familyLabels } from "@/lib/colour";
import { formatCategory } from "@/lib/format";
import type { Item } from "@/lib/types";

// Search (friend feedback, 2026-10-02): every word typed must appear
// somewhere in the piece's details, ignoring case and accents, so "levis"
// finds Levi's and "blue" finds a piece whose colour is in the blue family.

// Lowercase, without accents or apostrophes: "Levi’s Crème" → "levis creme".
function normalise(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/['’]/g, "")
    .toLowerCase();
}

// Everything a search can match for one piece.
function searchableText(item: Item): string {
  return normalise(
    [
      item.name,
      item.brand,
      item.colour,
      item.colourHex && familyLabels[colourFamily(item.colourHex)],
      item.material,
      item.size,
      item.acquiredFrom,
      item.category && formatCategory(item.category),
      item.acquired?.year,
      item.leftVia,
      item.notes,
    ]
      .filter(Boolean)
      .join(" "),
  );
}

export function searchItems(items: Item[], query: string): Item[] {
  const words = normalise(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return items;
  return items.filter((item) => {
    const text = searchableText(item);
    return words.every((word) => text.includes(word));
  });
}
