import type { Category } from "@/lib/categories";
import type { Item, LookPiece } from "@/lib/types";

// The automatic flat-lay a new look starts from (PRODUCT.md 17): head to
// toe, so the board is never empty and always tidy, ready to rearrange.
// Rows down the middle of the board: jackets and tops, then trousers and
// skirts, then shoes; bags, sunglasses, accessories (and pieces without a
// category) in a column on the right. Each row spreads its pieces evenly;
// rows keep their place even when another is empty.

type Band = "upper" | "lower" | "feet" | "side";

const bandOf: Record<Category, Band> = {
  jackets: "upper",
  tops: "upper",
  t_shirts: "upper",
  shirts: "upper",
  knitwear: "upper",
  sweatshirts: "upper",
  dresses: "upper",
  trousers: "lower",
  skirts: "lower",
  shoes: "feet",
  sneakers: "feet",
  bags: "side",
  sunglasses: "side",
  accessories: "side",
};

// Each row's height on the board (0 = top, 1 = bottom) and the widest a
// piece in it may be (a share of the board's width).
const rows: Record<Exclude<Band, "side">, { y: number; maxWidth: number }> = {
  upper: { y: 0.22, maxWidth: 0.44 },
  lower: { y: 0.56, maxWidth: 0.4 },
  feet: { y: 0.86, maxWidth: 0.24 },
};

export function autoLayout(items: Item[]): LookPiece[] {
  const band = (item: Item): Band => (item.category ? bandOf[item.category] : "side");
  const side = items.filter((item) => band(item) === "side");
  // With a side column, the middle rows leave room for it on the right.
  const [left, right] = side.length > 0 ? [0.06, 0.74] : [0.1, 0.9];
  const span = right - left;
  const pieces: LookPiece[] = [];

  // Lower rows first, so tops and jackets lie over the waistband.
  for (const name of ["feet", "lower", "upper"] as const) {
    const inRow = items.filter((item) => band(item) === name);
    const { y, maxWidth } = rows[name];
    const width = Math.min(maxWidth, (span / Math.max(inRow.length, 1)) * 1.15);
    inRow.forEach((item, index) => {
      pieces.push({
        itemId: item.id,
        x: left + ((index + 0.5) * span) / inRow.length,
        y,
        width,
        rotation: 0,
        layer: pieces.length,
      });
    });
  }

  // Only bags and accessories: a row across the middle instead of a column
  // at the edge of an empty board.
  if (pieces.length === 0) {
    const width = Math.min(0.4, (0.8 / side.length) * 1.1);
    return side.map((item, index) => ({
      itemId: item.id,
      x: 0.1 + ((index + 0.5) * 0.8) / side.length,
      y: 0.5,
      width,
      rotation: 0,
      layer: index,
    }));
  }

  // The side column, top to bottom, on top of everything else.
  side.forEach((item, index) => {
    pieces.push({
      itemId: item.id,
      x: 0.87,
      y: 0.15 + (index * 0.7) / Math.max(side.length - 1, 1),
      width: Math.min(0.2, 0.7 / side.length),
      rotation: 0,
      layer: pieces.length,
    });
  });

  return pieces;
}
