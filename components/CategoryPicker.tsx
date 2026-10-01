import type { Category } from "@/lib/types";

const categories: Category[] = ["tops", "bottoms", "outerwear", "shoes", "accessories"];

type CategoryPickerProps = {
  value: Category | "";
  onChange: (category: Category | "") => void;
};

// The fixed category list as text options: active ink with an underline,
// inactive stone. Tapping the chosen one again clears it (category is optional).
export default function CategoryPicker({ value, onChange }: CategoryPickerProps) {
  return (
    <fieldset>
      <legend className="text-label uppercase">Category</legend>
      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-3">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            aria-pressed={value === category}
            onClick={() => onChange(value === category ? "" : category)}
            className={`cursor-pointer text-label uppercase underline-offset-4 ${
              value === category ? "text-ink underline" : "text-stone"
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
