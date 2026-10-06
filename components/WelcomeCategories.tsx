import Chip from "@/components/Chip";
import { categories, type Category } from "@/lib/categories";
import { formatCategory } from "@/lib/format";

type WelcomeCategoriesProps = {
  value: Category[];
  // A state setter: each tap starts from the latest list, so quick taps in a
  // row all count.
  onChange: React.Dispatch<React.SetStateAction<Category[]>>;
};

// Onboarding step 2 (15¼b): "What's in your closet?" Every category as a
// chip; tick all that apply. Kept in the list's own order.
export default function WelcomeCategories({ value, onChange }: WelcomeCategoriesProps) {
  function toggle(category: Category) {
    onChange((current) => {
      const next = current.includes(category) ? current.filter((c) => c !== category) : [...current, category];
      return categories.filter((c) => next.includes(c));
    });
  }

  return (
    <fieldset>
      <legend className="text-label uppercase">
        Categories{value.length > 0 && ` · ${value.length}`}
      </legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {categories.map((category) => (
          <Chip key={category} chosen={value.includes(category)} onClick={() => toggle(category)}>
            {formatCategory(category)}
          </Chip>
        ))}
      </div>
    </fieldset>
  );
}
