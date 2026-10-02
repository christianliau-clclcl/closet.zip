"use client";

import { useEffect, useRef, useState } from "react";

// A small panel that opens from a button (SORT, VIEW, MENU, ADD TO FOLDER):
// open/closed state, closing on Esc or a tap anywhere outside the wrapper.
// Put `wrapper` on the element holding both the button and the panel.
export function usePopover() {
  const [open, setOpen] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!wrapper.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return { open, setOpen, wrapper };
}
