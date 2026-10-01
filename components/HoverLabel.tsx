"use client";

import { useLayoutEffect, useRef } from "react";
import { hoverLabel } from "@/lib/format";
import type { Item } from "@/lib/types";

type HoverLabelProps = {
  item: Item | undefined; // the hovered or focused garment
  anchor: HTMLElement | null; // the cell focused with the keyboard, or null to follow the pointer
};

const POINTER_GAP = 16; // px between the pointer and the label

// Puts the label's top-left corner `gap` px below and right of (x, y). Near the
// right or bottom edge it flips to the other side, so it never runs off screen.
function place(label: HTMLElement, x: number, y: number, gap: number) {
  const { width, height } = label.getBoundingClientRect();
  const left = x + gap + width <= window.innerWidth ? x + gap : x - gap - width;
  const top = y + gap + height <= window.innerHeight ? y + gap : y - gap - height;
  label.style.transform = `translate(${Math.max(0, left)}px, ${Math.max(0, top)}px)`;
}

// A small square label beside the pointer showing the hovered garment's
// "brand | year" (DESIGN.md "Hover label"), cut off with … when it's long.
// With the keyboard it sits under the focused cell instead. Only on devices
// that can hover; on touch screens tapping opens the overlay. Hidden from
// screen readers, which hear the full line as each cell's label.
export default function HoverLabel({ item, anchor }: HoverLabelProps) {
  const labelRef = useRef<HTMLParagraphElement>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const text = item ? hoverLabel(item) : "";

  // The label is moved directly rather than re-rendered on every mouse move,
  // so it keeps up with the pointer. It's always in the page (empty and hidden
  // when nothing is hovered), so the pointer is tracked even before it shows.
  useLayoutEffect(() => {
    const label = labelRef.current;
    if (!label) return;

    function update() {
      if (!label) return;
      if (anchor) {
        const cell = anchor.getBoundingClientRect();
        place(label, cell.left, cell.bottom, 0);
      } else {
        place(label, pointer.current.x, pointer.current.y, POINTER_GAP);
      }
    }
    function onPointerMove(event: PointerEvent) {
      pointer.current = { x: event.clientX, y: event.clientY };
      update();
    }

    update();
    window.addEventListener("pointermove", onPointerMove);
    // capture: also hears a category row scrolling sideways, not just the page.
    window.addEventListener("scroll", update, { capture: true, passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", update, { capture: true });
      window.removeEventListener("resize", update);
    };
  }, [anchor, text]);

  return (
    <p
      ref={labelRef}
      aria-hidden
      className={`pointer-events-none fixed top-0 left-0 z-10 max-w-xs truncate bg-ink px-2 py-1 text-canvas ${text ? "hidden [@media(hover:hover)]:block" : "hidden"}`}
    >
      {text}
    </p>
  );
}
