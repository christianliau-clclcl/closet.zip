type ChipProps = {
  chosen: boolean;
  onClick: () => void;
  children: React.ReactNode;
};

// One compact boxed chip (faster logging, 2026-10-03; DESIGN.md "Chips"):
// 32px tall, a rule border on white, filled ink when chosen. A real button
// that says whether it's chosen, so keyboards and screen readers work.
export default function Chip({ chosen, onClick, children }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={chosen}
      onClick={onClick}
      className={`inline-flex h-8 cursor-pointer items-center border px-2.5 text-label uppercase focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-ink ${
        chosen ? "border-ink bg-ink text-cell" : "border-rule bg-cell text-ink"
      }`}
    >
      {children}
    </button>
  );
}
