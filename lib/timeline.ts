import type { Item } from "@/lib/types";

// Style over time (PRODUCT.md Milestone 13): pieces laid out by when they
// were acquired. Pure logic, no drawing.

export type Slot = {
  key: string;
  kind: "month" | "year" | "none"; // "year": a year with no month; "none": N.D.
  year?: number;
  month?: number; // 1–12, for "month" slots
  label?: string; // shown under the axis: the year where a year starts, or "N.D."
  items: Item[];
};

// Every month from the earliest piece to the latest, in real time (empty
// months included, so gaps show). Pieces known only by year go in a slot
// labelled with the year, just before that January. Pieces without a date
// go in "N.D." (no date) at the end.
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
      const yearStart = slots.length;
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
      if (slots[yearStart]) slots[yearStart].label = String(year);
    }
  }

  if (undated.length > 0) slots.push({ key: "none", kind: "none", label: "N.D.", items: undated });
  return slots;
}

// "March 2021", "2019" or "No date": for screen readers and the hover label.
export function slotName(slot: Slot): string {
  if (slot.kind === "none") return "No date";
  if (slot.kind === "year") return String(slot.year);
  return new Date(slot.year!, slot.month! - 1).toLocaleDateString("en", { month: "long", year: "numeric" });
}
