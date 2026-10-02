"use client";

type SearchFieldProps = {
  value: string;
  onChange: (query: string) => void;
  autoFocus?: boolean; // the phone's bar opens straight into typing
  className?: string;
};

// The closet's search field (friend feedback, 2026-10-02): quiet, no box,
// just a rule line underneath that turns ink while typing. Filters as you
// type (matching in lib/search.ts).
export default function SearchField({ value, onChange, autoFocus, className = "" }: SearchFieldProps) {
  return (
    <input
      type="search"
      aria-label="Search your closet"
      placeholder="Search"
      value={value}
      autoFocus={autoFocus}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === "Escape") onChange("");
      }}
      className={`border-b border-rule bg-transparent py-1 outline-none placeholder:text-stone focus:border-ink ${className}`}
    />
  );
}
