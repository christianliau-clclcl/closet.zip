"use client";

import { useEffect, useRef, useState } from "react";

// MENU in the top bar on phones: a small panel under it, like the SORT list,
// for things used now and then (zoom, log out). Closes on Esc or a tap
// anywhere else. Desktop shows these in the top bar directly.
export default function PhoneMenu({ children }: { children: React.ReactNode }) {
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

  return (
    <div ref={wrapper} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen(!open)}
        className="cursor-pointer text-label uppercase"
      >
        Menu
      </button>
      {open && (
        <div className="absolute top-full right-0 z-20 mt-3 flex w-48 flex-col items-start gap-4 border border-rule bg-cell p-4">
          {children}
        </div>
      )}
    </div>
  );
}
