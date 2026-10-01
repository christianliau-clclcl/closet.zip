import { viewLabels, type View } from "@/lib/views";

type ViewBarProps = {
  view: View;
  options: readonly View[]; // FOLDERS only for logged-in people
  onChange: (view: View) => void;
  children?: React.ReactNode; // sort, filter (and later arrange), on the right
};

// The quiet second row under the top bar (DESIGN.md "View bar"): the views on
// the left, active in ink with an underline, the rest in stone. Sort, filter
// and arrange will sit on the right. On narrow phones the views scroll sideways.
export default function ViewBar({ view, options, onChange, children }: ViewBarProps) {
  return (
    <nav aria-label="Views" className="flex items-center justify-between gap-6 border-b border-rule px-4 py-3 md:px-8">
      <div className="flex gap-6 overflow-x-auto">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            aria-current={view === option ? "page" : undefined}
            className={`shrink-0 cursor-pointer text-label uppercase underline-offset-4 ${
              view === option ? "text-ink underline" : "text-stone"
            }`}
          >
            {viewLabels[option]}
          </button>
        ))}
      </div>
      {children && <div className="flex shrink-0 items-center gap-6">{children}</div>}
    </nav>
  );
}
