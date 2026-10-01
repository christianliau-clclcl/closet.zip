type OptionPickerProps<T extends string> = {
  legend: string;
  options: readonly T[];
  value: T | "";
  onChange: (value: T | "") => void;
};

// A short fixed list as text options: active ink with an underline, inactive
// stone. Tapping the chosen one again clears it (these fields are optional).
// Used for category and for how an archived piece left.
export default function OptionPicker<T extends string>({ legend, options, value, onChange }: OptionPickerProps<T>) {
  return (
    <fieldset>
      <legend className="text-label uppercase">{legend}</legend>
      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-3">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={value === option}
            onClick={() => onChange(value === option ? "" : option)}
            className={`cursor-pointer text-label uppercase underline-offset-4 ${
              value === option ? "text-ink underline" : "text-stone"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
