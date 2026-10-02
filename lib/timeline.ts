import type { Item } from "@/lib/types";

// Style over time (PRODUCT.md Milestone 13): pieces laid out by when they
// were acquired. Pure logic, no drawing.

// Gaps longer than this many empty months are shortened to one break (13d).
export const GAP_MONTHS = 6;

export type Slot = {
  key: string;
  // "year": a year with no month; "none": N.D.; "break": a long gap, shortened
  kind: "month" | "year" | "none" | "break";
  gapMonths?: number; // for "break": how many empty months it stands for
  year?: number;
  month?: number; // 1–12, for "month" slots
  label?: string; // shown under the axis: the year where a year starts, or "N.D."
  items: Item[];
};

// Every month from the earliest piece to the latest, in real time (empty
// months included, so gaps show). Pieces known only by year go in a slot
// labelled with the year, just before that January. Pieces without a date
// go in "N.D." (no date) at the end. Gaps longer than GAP_MONTHS empty months
// become one "break" slot (drawn as //, labelled with the gap's length), so
// long pauses don't mean scrolling past nothing; the first month after a
// break shows its year again.
export function timeline(items: Item[]): Slot[] {
  const dated = items.filter((item) => item.acquired);
  const undated = items.filter((item) => !item.acquired);
  const slots: Slot[] = [];

  if (dated.length > 0) {
    const years = dated.map((item) => item.acquired!.year);
    const [firstYear, lastYear] = [Math.min(...years), Math.max(...years)];
    const monthsIn = (year: number) =>
      dated.filter((i) => i.acquired!.year === year && i.acquired!.month).map((i) => i.acquired!.month!);

    for (let year = firstYear; year <= lastYear; year++) {
      const yearOnly = dated.filter((i) => i.acquired!.year === year && !i.acquired!.month);
      if (yearOnly.length > 0) slots.push({ key: `${year}`, kind: "year", year, items: yearOnly });

      // The first year starts at its earliest month; the last ends at its latest.
      // (If the first year has no months, its year slot stands for all of it.)
      const first = year === firstYear ? Math.min(...monthsIn(year), 13) : 1;
      const last = year === lastYear ? Math.max(...monthsIn(year), 0) : 12;
      for (let month = first; month <= last; month++) {
        slots.push({
          key: `${year}-${month}`,
          kind: "month",
          year,
          month,
          items: dated.filter((i) => i.acquired!.year === year && i.acquired!.month === month),
        });
      }
    }
  }

  const shortened = shortenGaps(slots);

  if (undated.length > 0) shortened.push({ key: "none", kind: "none", label: "N.D.", items: undated });
  return shortened;
}

// Replaces each run of more than GAP_MONTHS empty months with one break, then
// labels the year wherever one starts or the timeline resumes after a break.
function shortenGaps(slots: Slot[]): Slot[] {
  const result: Slot[] = [];
  for (let i = 0; i < slots.length; ) {
    let end = i;
    while (end < slots.length && slots[end].kind === "month" && slots[end].items.length === 0) end++;
    const run = end - i;
    if (run > GAP_MONTHS) {
      result.push({ key: `break-${slots[i].key}`, kind: "break", gapMonths: run, label: gapLength(run), items: [] });
      i = end;
    } else if (run > 0) {
      result.push(...slots.slice(i, end));
      i = end;
    } else {
      result.push(slots[i]);
      i++;
    }
  }
  return result.map((slot, i) => {
    if (slot.kind === "break") return slot;
    const before = result[i - 1];
    const startsYear = !before || before.kind === "break" || before.year !== slot.year;
    return { ...slot, label: startsYear ? String(slot.year) : undefined };
  });
}

// The slots in display order (newest first by default, or oldest first),
// with N.D. always last. The year is labelled on the first slot of each year
// in that order, and again after every break.
export function inOrder(slots: Slot[], newestFirst: boolean): Slot[] {
  const dated = slots.filter((slot) => slot.kind !== "none");
  const undated = slots.filter((slot) => slot.kind === "none");
  const ordered = newestFirst ? [...dated].reverse() : dated;
  const labelled = ordered.map((slot, i) => {
    if (slot.kind === "break") return slot;
    const before = ordered[i - 1];
    const startsYear = !before || before.kind === "break" || before.year !== slot.year;
    return { ...slot, label: startsYear ? String(slot.year) : undefined };
  });
  return [...labelled, ...undated];
}

// "4 yrs 11 mos", "1 yr", "8 mos": a break's length (shown in uppercase).
export function gapLength(months: number, long = false): string {
  const [years, rest] = [Math.floor(months / 12), months % 12];
  const unit = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
  const parts = [
    years > 0 && unit(years, long ? "year" : "yr", long ? "years" : "yrs"),
    rest > 0 && unit(rest, long ? "month" : "mo", long ? "months" : "mos"),
  ];
  return parts.filter(Boolean).join(" ");
}

// "March 2021", "2019" or "No date": for screen readers and the hover label.
export function slotName(slot: Slot): string {
  if (slot.kind === "none") return "No date";
  if (slot.kind === "break") return `Gap of ${gapLength(slot.gapMonths!, true)}`;
  if (slot.kind === "year") return String(slot.year);
  return new Date(slot.year!, slot.month! - 1).toLocaleDateString("en", { month: "long", year: "numeric" });
}
