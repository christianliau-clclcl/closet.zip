import type { Unit } from "@/lib/measurements";

const units: Unit[] = ["in", "cm"];

type UnitSwitchProps = {
  value: Unit;
  onChange: (unit: Unit) => void;
};

// "IN · CM": the chosen unit in ink with an underline, the other in stone.
export default function UnitSwitch({ value, onChange }: UnitSwitchProps) {
  return (
    <div role="group" aria-label="Measurement unit" className="flex gap-3">
      {units.map((unit) => (
        <button
          key={unit}
          type="button"
          aria-pressed={value === unit}
          onClick={() => onChange(unit)}
          className={`cursor-pointer text-label uppercase underline-offset-4 ${
            value === unit ? "text-ink underline" : "text-stone"
          }`}
        >
          {unit}
        </button>
      ))}
    </div>
  );
}
