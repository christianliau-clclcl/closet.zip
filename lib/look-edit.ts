import type { LookPiece } from "@/lib/types";

// The editing rules for a look's board (Milestone 17c), kept apart from the
// editor so they can be checked on their own. Pieces stay in bottom-to-top
// order, with layers 0, 1, 2… matching that order.

// The database's limits (look_items), kept a little inside them.
const LIMITS = { min: -0.3, max: 1.3, minWidth: 0.06, maxWidth: 1.4 };

export function clampPiece(piece: LookPiece): LookPiece {
  return {
    ...piece,
    x: Math.min(LIMITS.max, Math.max(LIMITS.min, piece.x)),
    y: Math.min(LIMITS.max, Math.max(LIMITS.min, piece.y)),
    width: Math.min(LIMITS.maxWidth, Math.max(LIMITS.minWidth, piece.width)),
    rotation: normaliseAngle(piece.rotation),
  };
}

// Any angle as -180…180 degrees.
export function normaliseAngle(degrees: number): number {
  const turned = ((((degrees + 180) % 360) + 360) % 360) - 180;
  return Math.round(turned * 10) / 10;
}

// Layers renumbered from the pieces' order.
function relayer(pieces: LookPiece[]): LookPiece[] {
  return pieces.map((piece, index) => ({ ...piece, layer: index }));
}

export function updatePiece(pieces: LookPiece[], itemId: string, change: Partial<LookPiece>): LookPiece[] {
  return pieces.map((piece) => (piece.itemId === itemId ? clampPiece({ ...piece, ...change }) : piece));
}

// FORWARD and BACK: one step up or down the stack.
export function moveLayer(pieces: LookPiece[], itemId: string, step: 1 | -1): LookPiece[] {
  const sorted = [...pieces].sort((a, b) => a.layer - b.layer);
  const from = sorted.findIndex((piece) => piece.itemId === itemId);
  const to = from + step;
  if (from < 0 || to < 0 || to >= sorted.length) return relayer(sorted);
  [sorted[from], sorted[to]] = [sorted[to], sorted[from]];
  return relayer(sorted);
}

// A piece tapped in the strip: dropped in the middle, on top of the rest.
export function addPiece(pieces: LookPiece[], itemId: string): LookPiece[] {
  if (pieces.some((piece) => piece.itemId === itemId)) return pieces;
  return relayer([
    ...[...pieces].sort((a, b) => a.layer - b.layer),
    { itemId, x: 0.5, y: 0.5, width: 0.36, rotation: 0, layer: pieces.length },
  ]);
}

export function removePiece(pieces: LookPiece[], itemId: string): LookPiece[] {
  return relayer([...pieces].sort((a, b) => a.layer - b.layer).filter((piece) => piece.itemId !== itemId));
}
