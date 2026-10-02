// The mark on a hidden piece or folder (Milestone 15b): a crossed-out eye in
// 1px `stone` lines, 12px, top-right of the cell. Decorative: the cell's
// label says "Hidden from public" for screen readers.
export default function HiddenIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 12 12"
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth={1}
      className={`size-3 text-stone ${className}`}
    >
      {/* the eye */}
      <path d="M1 6 C 3 2.5, 9 2.5, 11 6 C 9 9.5, 3 9.5, 1 6 Z" vectorEffect="non-scaling-stroke" />
      <circle cx="6" cy="6" r="1.5" vectorEffect="non-scaling-stroke" />
      {/* crossed out */}
      <line x1="1.5" y1="10.5" x2="10.5" y2="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
