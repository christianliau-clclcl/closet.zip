import { useId } from "react";
import FormField from "@/components/FormField";
import MeasurementFields from "@/components/MeasurementFields";
import MonthYearField from "@/components/MonthYearField";
import OptionPicker from "@/components/OptionPicker";
import type { ItemDraft } from "@/lib/item-draft";
import type { Unit } from "@/lib/measurements";
import type { Category } from "@/lib/types";

const categories: Category[] = ["tops", "bottoms", "outerwear", "shoes", "accessories"];

type ItemDetailsFieldsProps = {
  draft: ItemDraft;
  onChange: (draft: ItemDraft) => void;
  brandSuggestions: string[]; // brands already used in this closet
  unit: Unit; // for measurements
  onUnitChange: (unit: Unit) => void;
};

// Every optional detail of an item, in the order of PRODUCT.md's "Item data"
// table. Used by the Add page now, and by editing in Milestone 6.
export default function ItemDetailsFields({
  draft,
  onChange,
  brandSuggestions,
  unit,
  onUnitChange,
}: ItemDetailsFieldsProps) {
  const brandListId = useId();
  const notesId = useId();

  function set<K extends keyof ItemDraft>(key: K, value: ItemDraft[K]) {
    onChange({ ...draft, [key]: value });
  }

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h2 className="text-label uppercase">Details</h2>
        <p className="mt-1 text-stone">All optional. You can add them later.</p>
      </div>

      <FormField label="Name" value={draft.name} onChange={(e) => set("name", e.target.value)} />

      <OptionPicker
        legend="Category"
        options={categories}
        value={draft.category}
        onChange={(category) => set("category", category)}
      />

      <div>
        <FormField
          label="Brand"
          list={brandListId}
          autoComplete="off"
          value={draft.brand}
          onChange={(e) => set("brand", e.target.value)}
        />
        {/* The browser's own suggestion list: brands you've used before. */}
        <datalist id={brandListId}>
          {brandSuggestions.map((brand) => (
            <option key={brand} value={brand} />
          ))}
        </datalist>
      </div>

      <FormField label="Colour" value={draft.colour} onChange={(e) => set("colour", e.target.value)} />

      <FormField label="Material" value={draft.material} onChange={(e) => set("material", e.target.value)} />

      <MonthYearField
        legend="Acquired"
        month={draft.acquiredMonth}
        year={draft.acquiredYear}
        onMonthChange={(month) => set("acquiredMonth", month)}
        onYearChange={(year) => set("acquiredYear", year)}
      />

      <FormField
        label="Acquired from"
        placeholder="Store, person, website, thrift…"
        value={draft.acquiredFrom}
        onChange={(e) => set("acquiredFrom", e.target.value)}
      />

      <FormField
        label="Price ($)"
        inputMode="decimal"
        placeholder="0.00"
        value={draft.price}
        onChange={(e) => set("price", e.target.value)}
      />

      <FormField
        label="Size"
        placeholder="As on the label: M, 32 × 30, EU 42"
        value={draft.size}
        onChange={(e) => set("size", e.target.value)}
      />

      <MeasurementFields
        category={draft.category}
        unit={unit}
        onUnitChange={onUnitChange}
        values={draft.measurements}
        onChange={(key, text) => set("measurements", { ...draft.measurements, [key]: text })}
      />

      <div>
        <label htmlFor={notesId} className="text-label uppercase">
          Notes
        </label>
        <textarea
          id={notesId}
          rows={6}
          placeholder="What you love about it, how you found it, what it reminds you of."
          value={draft.notes}
          onChange={(e) => set("notes", e.target.value)}
          className="mt-2 w-full resize-y border border-rule bg-cell px-3 py-3 font-serif text-notes outline-none placeholder:text-stone focus:border-ink"
        />
      </div>
    </section>
  );
}
