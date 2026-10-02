// Phones only: a bar fixed to the bottom of the screen, within thumb reach,
// for the closet's tools (DESIGN.md "Bottom bar"): SORT and FILTER on the
// left, + ADD on the right. Same look as the other bars, with the rule line
// on top. Leaves room for the iPhone home indicator.
export default function BottomBar({ tools, action }: { tools?: React.ReactNode; action?: React.ReactNode }) {
  if (!tools && !action) return null;
  return (
    <nav
      aria-label="Tools"
      className="fixed inset-x-0 bottom-0 z-10 flex items-center justify-between gap-6 border-t border-rule bg-canvas px-4 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))] md:hidden"
    >
      <div className="flex items-center gap-6">{tools}</div>
      {action}
    </nav>
  );
}
