import UnitSwitch from "@/components/UnitSwitch";
import type { ItemDraft } from "@/lib/item-draft";
import { measurementLabels, measurementRows, type MeasurementKey, type Unit } from "@/lib/measurements";
import type { Category } from "@/lib/types";

type MeasurementFieldsProps = {
  category: Category | "";
  unit: Unit;
  onUnitChange: (unit: Unit) => void;
  values: ItemDraft["measurements"];
  onChange: (key: MeasurementKey, text: string) => void;
};

// The garment's measurements as a simple table: one row per measurement for
// this category, label on the left and the number on the right, all optional.
// Shoes have none (the size label covers them), so nothing is shown.
export default function MeasurementFields({ category, unit, onUnitChange, values, onChange }: MeasurementFieldsProps) {
  const rows = measurementRows(category);
  if (rows.length === 0) return null;

  return (
    <fieldset>
      {/* A legend only works as the fieldset's first child, so screen readers
          get this hidden one; the visible heading sits beside the unit switch. */}
      <legend className="sr-only">Measurements</legend>
      <div className="flex items-baseline justify-between">
        <span aria-hidden className="text-label uppercase">
          Measurements
        </span>
        <UnitSwitch value={unit} onChange={onUnitChange} />
      </div>
      <p className="mt-1 text-stone">Measured flat.</p>
      <div className="mt-2 border-t border-rule">
        {rows.map((key) => (
          <label key={key} className="flex items-center justify-between gap-4 border-b border-rule py-2">
            <span className="text-label text-stone uppercase">{measurementLabels[key]}</span>
            <span className="flex items-center gap-2">
              <input
                type="text"
                inputMode="decimal"
                value={values[key] ?? ""}
                onChange={(event) => onChange(key, event.target.value)}
                className="w-20 border border-rule bg-cell px-3 py-2 text-right outline-none focus:border-ink"
              />
              <span className="w-5 text-stone">{unit}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
