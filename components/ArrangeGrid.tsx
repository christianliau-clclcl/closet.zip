"use client";

import { MotionConfig, Reorder, useDragControls } from "motion/react";
import { useEffect, useRef } from "react";
import FadeImage from "@/components/FadeImage";
import { itemTitle } from "@/lib/format";
import { layoutTransition } from "@/lib/motion";
import type { Item } from "@/lib/types";
import { zoomStyles, type Zoom } from "@/lib/zoom";

type ArrangeGridProps = {
  items: Item[]; // in the order being arranged
  zoom: Zoom;
  onReorder: (items: Item[]) => void;
};

const HOLD_MS = 300; // how long a finger rests on a piece before it lifts
const MOVE_TOLERANCE = 8; // px a finger may wander and still count as resting

// ARRANGE mode's grid (PRODUCT.md Milestone 12g): the same cells as the
// closet, which can be dragged into a new order (motion's Reorder, like the
// photo manager) or moved one step with ← → under each. With a mouse, drag
// straight away; on touch screens, press and hold briefly first, so a normal
// swipe still scrolls the page.
export default function ArrangeGrid({ items, zoom, onReorder }: ArrangeGridProps) {
  function move(from: number, to: number) {
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onReorder(next);
  }

  return (
    // reducedMotion="user": with Reduce motion on, pieces jump instead of gliding.
    <MotionConfig transition={layoutTransition} reducedMotion="user">
      <Reorder.Group
        axis="xy"
        values={items}
        onReorder={onReorder}
        className={`grid gap-2 ${zoomStyles[zoom].columns}`}
      >
        {items.map((item, index) => (
          <ArrangeCell
            key={item.id}
            item={item}
            zoom={zoom}
            first={index === 0}
            last={index === items.length - 1}
            onMove={(step) => move(index, index + step)}
          />
        ))}
      </Reorder.Group>
    </MotionConfig>
  );
}

type ArrangeCellProps = {
  item: Item;
  zoom: Zoom;
  first: boolean;
  last: boolean;
  onMove: (step: -1 | 1) => void;
};

function ArrangeCell({ item, zoom, first, last, onMove }: ArrangeCellProps) {
  const style = zoomStyles[zoom];
  const controls = useDragControls();
  const hold = useRef<{ timer: number; x: number; y: number } | null>(null);
  const dragging = useRef(false);
  const cell = useRef<HTMLLIElement>(null);

  // While a piece is lifted on a touch screen, stop the page from scrolling
  // under the finger (touch-action can't change once a touch has started).
  useEffect(() => {
    const element = cell.current;
    if (!element) return;
    const stopScroll = (event: TouchEvent) => {
      if (dragging.current) event.preventDefault();
    };
    element.addEventListener("touchmove", stopScroll, { passive: false });
    return () => element.removeEventListener("touchmove", stopScroll);
  }, []);

  function cancelHold() {
    if (hold.current) window.clearTimeout(hold.current.timer);
    hold.current = null;
  }

  const arrow = "cursor-pointer px-2 text-stone disabled:invisible";

  return (
    <Reorder.Item
      ref={cell}
      value={item}
      dragListener={false}
      dragControls={controls}
      onDragStart={() => (dragging.current = true)}
      onDragEnd={() => (dragging.current = false)}
      // Let the page scroll vertically until a piece is lifted.
      style={{ touchAction: "pan-y" }}
      className="relative cursor-grab bg-canvas active:cursor-grabbing"
      onPointerDown={(event) => {
        // The ← → buttons are for tapping, not dragging.
        if ((event.target as Element).closest("button")) return;
        if (event.pointerType === "mouse") {
          controls.start(event);
          return;
        }
        const pointerEvent = event.nativeEvent;
        hold.current = {
          x: event.clientX,
          y: event.clientY,
          timer: window.setTimeout(() => {
            hold.current = null;
            controls.start(pointerEvent);
          }, HOLD_MS),
        };
      }}
      onPointerMove={(event) => {
        // Moved before the hold finished: it's a scroll, not a drag.
        const start = hold.current;
        if (start && Math.hypot(event.clientX - start.x, event.clientY - start.y) > MOVE_TOLERANCE) cancelHold();
      }}
      onPointerUp={cancelHold}
      onPointerCancel={cancelHold}
    >
      <div className={`relative flex aspect-square w-full flex-col select-none ${style.padding}`}>
        <span aria-hidden className="absolute top-2 left-2 size-0.75 rounded-full bg-ink" />
        <span className="relative block flex-1">
          <FadeImage
            src={item.hero.thumbSrc ?? item.hero.src}
            alt={itemTitle(item)}
            fill
            sizes={style.sizes}
            unoptimized={item.hero.unoptimized}
            draggable={false}
            className="pointer-events-none object-contain"
          />
        </span>
      </div>
      {/* One step at a time, for precise moves and for keyboards. */}
      <div className="flex justify-center gap-2">
        <button type="button" onClick={() => onMove(-1)} disabled={first} aria-label={`Move ${itemTitle(item)} earlier`} className={arrow}>
          ←
        </button>
        <button type="button" onClick={() => onMove(1)} disabled={last} aria-label={`Move ${itemTitle(item)} later`} className={arrow}>
          →
        </button>
      </div>
    </Reorder.Item>
  );
}
