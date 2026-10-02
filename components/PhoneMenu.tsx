"use client";

import { usePopover } from "@/lib/use-popover";

// MENU in the top bar on phones: a small panel under it, like the SORT list,
// for things used now and then (log out for now). Closes on Esc or a tap
// anywhere else. Desktop shows these in the top bar directly.
export default function PhoneMenu({ children }: { children: React.ReactNode }) {
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
