import Chip from "@/components/Chip";

type ChipPickerProps<T extends string> = {
  legend: string;
  options: readonly T[];
  labelFor?: (option: T) => string; // shown text, if not the value itself
  value: T | "";
  onChange: (value: T | "") => void;
  hint?: string;
  children?: React.ReactNode; // shown under the chips (e.g. a field to type in)
};

// One choice from a short list, as compact boxed chips (DESIGN.md "Chips").
// Tapping the chosen chip again clears it (these fields are optional).
export default function ChipPicker<T extends string>({
  legend,
  options,
  labelFor,
  value,
  onChange,
  hint,
  children,
}: ChipPickerProps<T>) {
  return (
    <fieldset>
      <legend className="text-label uppercase">{legend}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => (
          <Chip key={option} chosen={value === option} onClick={() => onChange(value === option ? "" : option)}>
            {labelFor ? labelFor(option) : option}
          </Chip>
        ))}
      </div>
      {hint && <p className="mt-2 text-stone">{hint}</p>}
      {children}
    </fieldset>
  );
}
