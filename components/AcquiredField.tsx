"use client";

import { useState } from "react";
import ChipPicker from "@/components/ChipPicker";
import MonthYearField from "@/components/MonthYearField";

type When = "this" | "last" | "earlier" | "unknown";
const options: When[] = ["this", "last", "earlier", "unknown"];
const labels: Record<When, string> = { this: "This month", last: "Last month", earlier: "Earlier…", unknown: "Don’t know" };

type AcquiredFieldProps = {
  month: string; // "" or "1"–"12"
  year: string;
  onChange: (month: string, year: string) => void;
};

// This month and last month as of today, as form values.
function monthsAgo(n: number): { month: string; year: string } {
  const date = new Date();
  date.setDate(1);
  date.setMonth(date.getMonth() - n);
  return { month: String(date.getMonth() + 1), year: String(date.getFullYear()) };
}

// Date acquired as chips (faster logging, 2026-10-03): THIS MONTH · LAST
// MONTH · EARLIER… · DON'T KNOW. EARLIER… shows the month and year fields;
// DON'T KNOW leaves the date empty. Starts on whichever matches the date.
export default function AcquiredField({ month, year, onChange }: AcquiredFieldProps) {
  const matches = (n: number) => month === monthsAgo(n).month && year === monthsAgo(n).year;
  const [when, setWhen] = useState<When>(() =>
    matches(0) ? "this" : matches(1) ? "last" : year ? "earlier" : "unknown",
  );

  function choose(next: When | "") {
    const picked = next || "unknown"; // tapping the chosen chip again: no date
    setWhen(picked);
    if (picked === "this") onChange(monthsAgo(0).month, monthsAgo(0).year);
    if (picked === "last") onChange(monthsAgo(1).month, monthsAgo(1).year);
    if (picked === "unknown") onChange("", "");
    // EARLIER… keeps what's there, to be changed below.
  }

  return (
    <ChipPicker legend="Acquired" options={options} labelFor={(w) => labels[w]} value={when} onChange={choose}>
      {when === "earlier" && (
        <div className="mt-4">
          <MonthYearField
            legend="When"
            month={month}
            year={year}
            onMonthChange={(m) => onChange(m, year)}
            onYearChange={(y) => onChange(month, y)}
          />
        </div>
      )}
    </ChipPicker>
  );
}
