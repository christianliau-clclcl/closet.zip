// The default folder cover (PRODUCT.md Milestone 12e): a lidded storage box
// drawn in 1px ink lines, flat and square like the rest of the interface.
// A placeholder until the designer's own drawing replaces this file.
// The lines stay 1px at every size (vector-effect), like the zoom slider.
export default function BoxIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth={1}
      className={`text-ink ${className}`}
    >
      {/* lid */}
      <rect x="18" y="30" width="64" height="10" vectorEffect="non-scaling-stroke" />
      {/* body */}
      <rect x="22" y="40" width="56" height="36" vectorEffect="non-scaling-stroke" />
      {/* handle slot */}
      <line x1="42" y1="52" x2="58" y2="52" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
