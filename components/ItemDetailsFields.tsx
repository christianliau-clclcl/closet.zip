import { useId, useState } from "react";
import ColourField from "@/components/ColourField";
import FormField from "@/components/FormField";
import MeasurementFields from "@/components/MeasurementFields";
import AcquiredField from "@/components/AcquiredField";
import { chipClass } from "@/components/Chip";
import ChipPicker from "@/components/ChipPicker";
import MaterialField from "@/components/MaterialField";
import { categories } from "@/lib/categories";
import { formatCategory } from "@/lib/format";
import type { ItemDraft } from "@/lib/item-draft";
import type { ClosetHistory } from "@/lib/items";
import type { Unit } from "@/lib/measurements";

type ItemDetailsFieldsProps = {
  draft: ItemDraft;
  // A state setter: updates start from the latest draft, so a colour detected
  // in the background never undoes what was typed in the meantime.
  onChange: React.Dispatch<React.SetStateAction<ItemDraft>>;
  photoSrc?: string; // the cover photo, for the colour eyedropper
  history: ClosetHistory; // your brands, materials and usual sizes, for suggestions
  unit: Unit; // for measurements
  onUnitChange: (unit: Unit) => void;
};

// Every optional detail of an item, in the order of PRODUCT.md's "Item data"
// table. Used by the Add page now, and by editing in Milestone 6.
export default function ItemDetailsFields({
  draft,
  onChange,
  photoSrc,
  history,
  unit,
  onUnitChange,
}: ItemDetailsFieldsProps) {
  const brandListId = useId();
  const notesId = useId();
  // Your categories from onboarding first (15¼b), MORE… for the rest. All of
  // them when you haven't said, or when the piece is already in another one.
  const mine = history.myCategories?.length ? history.myCategories : undefined;
  const [showAll, setShowAll] = useState(
    () => !mine || Boolean(draft.category && !mine.includes(draft.category)),
  );
  const shownCategories = showAll || !mine ? categories : mine;

  function set<K extends keyof ItemDraft>(key: K, value: ItemDraft[K]) {
    onChange((current) => ({ ...current, [key]: value }));
  }

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h2 className="text-label uppercase">Details</h2>
        <p className="mt-1 text-stone">All optional. You can add them later.</p>
      </div>

      <FormField label="Name" value={draft.name} onChange={(e) => set("name", e.target.value)} />

      <ChipPicker
        legend="Category"
        options={shownCategories}
        labelFor={formatCategory}
        last={
          !showAll && (
            <button type="button" onClick={() => setShowAll(true)} className={chipClass(false)}>
              More…
            </button>
          )
        }
        value={draft.category}
        onChange={(category) =>
          onChange((current) => {
            // Size follows the category with your usual size for it, unless
            // you've typed one yourself (an earlier usual size counts as not).
            const before = current.category ? history.usualSizes[current.category] : undefined;
            const untouched = !current.size || current.size === before;
            const usual = category ? history.usualSizes[category] : undefined;
            return { ...current, category, size: untouched ? (usual ?? "") : current.size };
          })
        }
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
          {history.brands.map((brand) => (
            <option key={brand} value={brand} />
          ))}
        </datalist>
      </div>

      <ColourField
        name={draft.colour}
        hex={draft.colourHex}
        onNameChange={(name) => set("colour", name)}
        onHexChange={(hex) => set("colourHex", hex)}
        photoSrc={photoSrc}
      />

      <MaterialField value={draft.material} onChange={(material) => set("material", material)} />

      <AcquiredField
        month={draft.acquiredMonth}
        year={draft.acquiredYear}
        onChange={(acquiredMonth, acquiredYear) => onChange((current) => ({ ...current, acquiredMonth, acquiredYear }))}
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
