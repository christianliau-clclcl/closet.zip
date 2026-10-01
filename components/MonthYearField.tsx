const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const inputClass =
  "w-full appearance-none border border-rule bg-cell px-3 py-3 outline-none placeholder:text-stone focus:border-ink";

type MonthYearFieldProps = {
  legend: string;
  month: string;
  year: string;
  onMonthChange: (month: string) => void;
  onYearChange: (year: string) => void;
};

// A month + year pair (dates are stored as month and year only). Both are
// optional, but a month needs a year; that's checked when saving.
export default function MonthYearField({
  legend,
  month,
  year,
  onMonthChange,
  onYearChange,
}: MonthYearFieldProps) {
  return (
    <fieldset>
      <legend className="text-label uppercase">{legend}</legend>
      <div className="mt-2 grid grid-cols-2 gap-4">
        <div className="relative">
          <select
            aria-label={`${legend} month`}
            value={month}
            onChange={(event) => onMonthChange(event.target.value)}
            className={`${inputClass} pr-8 ${month ? "" : "text-stone"}`}
          >
            <option value="">Month</option>
            {months.map((name, index) => (
              <option key={name} value={String(index + 1)} className="text-ink">
                {name}
              </option>
            ))}
          </select>
          <span aria-hidden className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-stone">
            ▾
          </span>
        </div>
        <input
          aria-label={`${legend} year`}
          type="text"
          inputMode="numeric"
          maxLength={4}
          placeholder="Year"
          value={year}
          onChange={(event) => onYearChange(event.target.value.replace(/\D/g, ""))}
          className={inputClass}
        />
      </div>
    </fieldset>
  );
}
