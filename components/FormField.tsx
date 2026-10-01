import { useId } from "react";

type FormFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  action?: React.ReactNode; // e.g. a SHOW button, placed at the label's right
};

// A labelled input from DESIGN.md: mono 11px uppercase label above, cell fill,
// 1px rule border that turns ink on focus, square corners.
export default function FormField({ label, hint, action, id, ...inputProps }: FormFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = `${inputId}-hint`;

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label htmlFor={inputId} className="text-label uppercase">
          {label}
        </label>
        {action}
      </div>
      <input
        id={inputId}
        aria-describedby={hint ? hintId : undefined}
        className="mt-2 w-full border border-rule bg-cell px-3 py-3 outline-none placeholder:text-stone focus:border-ink"
        {...inputProps}
      />
      {hint && (
        <p id={hintId} className="mt-2 text-stone">
          {hint}
        </p>
      )}
    </div>
  );
}
