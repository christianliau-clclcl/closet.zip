"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import FadeImage from "@/components/FadeImage";
import { itemTitle } from "@/lib/format";
import { addPiece, moveLayer, removePiece, updatePiece } from "@/lib/look-edit";
import { saveLookBoard } from "@/lib/looks-client";
import type { Item, Look, LookPiece } from "@/lib/types";

type LookEditorProps = {
  look: Look;
  items: Item[]; // every piece of yours, for the strip to add from
};

type Point = { x: number; y: number };

// What the pointers are doing: dragging a piece, pinching it with two
// fingers (size and turn), or pulling a corner handle (size). Each keeps the
// piece as it was when the gesture began, so moves are measured from there.
type Gesture =
  | { kind: "drag"; itemId: string; start: Point; piece: LookPiece }
  | { kind: "pinch"; itemId: string; distance: number; angle: number; piece: LookPiece }
  | { kind: "resize"; itemId: string; distance: number; piece: LookPiece };

const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
const angle = (a: Point, b: Point) => (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;

// ARRANGE on a look (Milestone 17c; option B on the "Looks explorations"
// canvas): the board on white with a rule outline. Drag a piece to move it;
// two fingers resize and turn it; on desktop, corner handles resize it.
// FORWARD · BACK change the layering, ↺ ↻ turn it 15°, REMOVE takes it off;
// the strip below adds pieces. Arrow keys move the chosen piece (Shift: more),
// Delete removes it. DONE saves the whole board at once; CANCEL drops changes.
// Handled with pointer events directly, so mouse, one finger and two fingers
// share one set of rules (lib/look-edit.ts).
export default function LookEditor({ look, items }: LookEditorProps) {
  const router = useRouter();
  const boardRef = useRef<HTMLDivElement>(null);
  const pointers = useRef(new Map<number, Point>());
  const gesture = useRef<Gesture | null>(null);
  // A finger on the empty board: lets go of the chosen piece only if it
  // turns out to be a tap, not the first finger of a pinch.
  const tapOnBoard = useRef(false);
  const [pieces, setPieces] = useState<LookPiece[]>(look.pieces);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const byId = new Map(items.map((item) => [item.id, item]));
  const shown = pieces.filter((piece) => byId.has(piece.itemId));
  const selected = shown.find((piece) => piece.itemId === selectedId);
  const notOnBoard = items.filter((item) => !pieces.some((piece) => piece.itemId === item.id));

  function change(itemId: string, update: Partial<LookPiece>) {
    setPieces((current) => updatePiece(current, itemId, update));
  }

  // Two fingers on the board while a piece is chosen: size and turn it.
  function startPinch(itemId: string) {
    const [a, b] = [...pointers.current.values()];
    const piece = pieces.find((p) => p.itemId === itemId);
    if (!piece || !a || !b) return;
    gesture.current = { kind: "pinch", itemId, distance: distance(a, b), angle: angle(a, b), piece };
  }

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    const board = boardRef.current;
    if (!board) return;
    // Keeps the gesture going when the finger slides off the board.
    try {
      board.setPointerCapture(event.pointerId);
    } catch {
      // A pointer that's already gone: the gesture still works on the board.
    }
    const point = { x: event.clientX, y: event.clientY };
    pointers.current.set(event.pointerId, point);
    const target = event.target as HTMLElement;
    const handleOf = target.closest<HTMLElement>("[data-handle]")?.dataset.handle;
    const pieceOf = target.closest<HTMLElement>("[data-piece]")?.dataset.piece;

    if (pointers.current.size === 2 && selectedId) {
      tapOnBoard.current = false;
      return startPinch(selectedId);
    }
    if (pointers.current.size > 1) return;

    if (handleOf && selected) {
      const rect = board.getBoundingClientRect();
      const centre = { x: rect.left + selected.x * rect.width, y: rect.top + selected.y * rect.height };
      gesture.current = { kind: "resize", itemId: selected.itemId, distance: distance(point, centre), piece: selected };
      return;
    }
    const piece = pieces.find((p) => p.itemId === pieceOf);
    if (piece) {
      setSelectedId(piece.itemId);
      gesture.current = { kind: "drag", itemId: piece.itemId, start: point, piece };
    } else {
      tapOnBoard.current = true; // decided when the finger lifts
      gesture.current = null;
    }
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const board = boardRef.current;
    const now = gesture.current;
    if (!board || !pointers.current.has(event.pointerId)) return;
    const point = { x: event.clientX, y: event.clientY };
    pointers.current.set(event.pointerId, point);
    if (!now) return;
    const rect = board.getBoundingClientRect();

    if (now.kind === "drag") {
      change(now.itemId, {
        x: now.piece.x + (point.x - now.start.x) / rect.width,
        y: now.piece.y + (point.y - now.start.y) / rect.height,
      });
    } else if (now.kind === "pinch") {
      const [a, b] = [...pointers.current.values()];
      if (!a || !b || now.distance === 0) return;
      change(now.itemId, {
        width: (now.piece.width * distance(a, b)) / now.distance,
        rotation: now.piece.rotation + angle(a, b) - now.angle,
      });
    } else {
      const centre = { x: rect.left + now.piece.x * rect.width, y: rect.top + now.piece.y * rect.height };
      if (now.distance === 0) return;
      change(now.itemId, { width: (now.piece.width * distance(point, centre)) / now.distance });
    }
  }

  function onPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    pointers.current.delete(event.pointerId);
    // A tap on the empty board lets go of the piece.
    if (tapOnBoard.current && pointers.current.size === 0) {
      tapOnBoard.current = false;
      setSelectedId(null);
    }
    const now = gesture.current;
    // Lifting one of two fingers: carry on dragging with the other.
    if (now?.kind === "pinch" && pointers.current.size === 1) {
      const [rest] = [...pointers.current.values()];
      const piece = pieces.find((p) => p.itemId === now.itemId);
      gesture.current = piece && rest ? { kind: "drag", itemId: now.itemId, start: rest, piece } : null;
      return;
    }
    if (pointers.current.size === 0) gesture.current = null;
  }

  function onPieceKey(event: React.KeyboardEvent<HTMLButtonElement>, piece: LookPiece) {
    const step = event.shiftKey ? 0.05 : 0.01;
    const moves: Record<string, Partial<LookPiece>> = {
      ArrowLeft: { x: piece.x - step },
      ArrowRight: { x: piece.x + step },
      ArrowUp: { y: piece.y - step },
      ArrowDown: { y: piece.y + step },
    };
    if (moves[event.key]) {
      event.preventDefault();
      change(piece.itemId, moves[event.key]);
    } else if (event.key === "Delete" || event.key === "Backspace") {
      event.preventDefault();
      remove(piece.itemId);
    }
  }

  function remove(itemId: string) {
    setPieces((current) => removePiece(current, itemId));
    setSelectedId(null);
  }

  async function save() {
    setBusy(true);
    setError(null);
    try {
      await saveLookBoard(look.id, pieces);
      router.push(`/looks/${look.id}`);
      router.refresh();
    } catch {
      setError("Couldn't save. Check your connection and try again.");
      setBusy(false);
    }
  }

  const tool = "cursor-pointer text-label uppercase underline underline-offset-4 disabled:cursor-default disabled:text-pebble disabled:no-underline";

  return (
    <main className="mx-auto w-full max-w-lg flex-1 px-4 pt-4 pb-16">
      <div className="flex items-baseline justify-between gap-6">
        <Link href={`/looks/${look.id}`} className="text-label text-stone uppercase underline-offset-4 hover:underline">
          Cancel
        </Link>
        <h1 className="min-w-0 truncate text-label text-stone uppercase">{look.name}</h1>
        <button type="button" onClick={save} disabled={busy} className="cursor-pointer text-label uppercase underline underline-offset-4 disabled:cursor-wait">
          {busy ? "Saving…" : "Done"}
        </button>
      </div>

      {/* The board: touch-action none, so dragging moves pieces rather than
          scrolling or zooming the page. */}
      <div
        ref={boardRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="relative mt-4 aspect-[3/4] w-full touch-none overflow-hidden border border-rule bg-cell select-none"
      >
        {shown.map((piece) => {
          const item = byId.get(piece.itemId)!;
          const isSelected = piece.itemId === selectedId;
          return (
            <button
              key={piece.itemId}
              type="button"
              data-piece={piece.itemId}
              aria-label={`${itemTitle(item)}${isSelected ? ", chosen: arrow keys move it, Delete removes it" : ""}`}
              aria-pressed={isSelected}
              onFocus={() => setSelectedId(piece.itemId)}
              onKeyDown={(event) => onPieceKey(event, piece)}
              className={`absolute block cursor-grab active:cursor-grabbing ${isSelected ? "outline-1 outline-ink" : "outline-none"}`}
              style={{
                left: `${piece.x * 100}%`,
                top: `${piece.y * 100}%`,
                width: `${piece.width * 100}%`,
                zIndex: piece.layer,
                transform: `translate(-50%, -50%) rotate(${piece.rotation}deg)`,
              }}
            >
              <FadeImage
                src={item.hero.src}
                alt=""
                width={600}
                height={600}
                sizes="50vw"
                draggable={false}
                unoptimized={item.hero.unoptimized}
                className="pointer-events-none block h-auto w-full"
              />
              {isSelected &&
                (["-top-1 -left-1", "-top-1 -right-1", "-bottom-1 -left-1", "-bottom-1 -right-1"] as const).map((corner) => (
                  <span
                    key={corner}
                    data-handle={corner}
                    aria-hidden
                    className={`absolute ${corner} size-2 cursor-nwse-resize border border-ink bg-cell`}
                  />
                ))}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-baseline gap-x-6 gap-y-2">
        <button type="button" disabled={!selected} onClick={() => selected && setPieces((c) => moveLayer(c, selected.itemId, 1))} className={tool}>
          Forward
        </button>
        <button type="button" disabled={!selected} onClick={() => selected && setPieces((c) => moveLayer(c, selected.itemId, -1))} className={tool}>
          Back
        </button>
        <button
          type="button"
          disabled={!selected}
          aria-label="Turn left 15 degrees"
          onClick={() => selected && change(selected.itemId, { rotation: selected.rotation - 15 })}
          className={tool}
        >
          ↺
        </button>
        <button
          type="button"
          disabled={!selected}
          aria-label="Turn right 15 degrees"
          onClick={() => selected && change(selected.itemId, { rotation: selected.rotation + 15 })}
          className={tool}
        >
          ↻
        </button>
        <button type="button" disabled={!selected} onClick={() => selected && remove(selected.itemId)} className={tool}>
          Remove
        </button>
        <span className="ml-auto text-label text-stone uppercase">
          {selected ? "Drag · two fingers to size" : "Tap a piece"}
        </span>
      </div>

      {error && (
        <p role="alert" className="mt-4">
          {error}
        </p>
      )}

      <h2 className="mt-8 text-label text-stone uppercase">Add pieces</h2>
      {notOnBoard.length > 0 ? (
        <ul className="mt-2 flex gap-2 overflow-x-auto pb-2">
          {notOnBoard.map((item) => (
            <li key={item.id} className="shrink-0">
              <button
                type="button"
                aria-label={`Add ${itemTitle(item)}`}
                onClick={() => {
                  setPieces((current) => addPiece(current, item.id));
                  setSelectedId(item.id);
                }}
                className="relative block size-14 cursor-pointer border border-rule bg-cell"
              >
                <FadeImage
                  src={item.hero.thumbSrc ?? item.hero.src}
                  alt=""
                  fill
                  sizes="56px"
                  unoptimized={item.hero.unoptimized}
                  className="object-contain p-1"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-stone">Every piece is on the board.</p>
      )}
    </main>
  );
}
