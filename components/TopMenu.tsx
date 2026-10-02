"use client";

import { usePopover } from "@/lib/use-popover";

// MENU in the top bar: a small panel under it, like the SORT list, for
// things used now and then (naming the closet, log out). Closes on Esc or a
// tap anywhere else.
export default function TopMenu({ children }: { children: React.ReactNode }) {
  const { open, setOpen, wrapper } = usePopover();

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
