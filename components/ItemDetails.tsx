import Swatch from "@/components/Swatch";
import UnitSwitch from "@/components/UnitSwitch";
import { colourFamily, familyLabels } from "@/lib/colour";
import { formatCategory, formatMonthYear, formatPrice, leftSummary } from "@/lib/format";
import {
  formatMeasurement,
  measurementLabels,
  measurementRows,
  type MeasurementKey,
  type Unit,
} from "@/lib/measurements";
import type { Item } from "@/lib/types";

type ItemDetailsProps = {
  item: Item;
  unit: Unit;
  onUnitChange: (unit: Unit) => void;
};

// The details panel content: label / value rows separated by rule lines, the
// garment's measurements in the person's unit, then the user's notes in
// Fraunces. Empty fields are left out, and a section with nothing in it isn't
// shown at all.
export default function ItemDetails({ item, unit, onUnitChange }: ItemDetailsProps) {
  // Colour: a swatch of the colour itself, then the name typed for it, or
  // the family ("Blue") when there's a colour but no name.
  const colourName = item.colour ?? (item.colourHex && familyLabels[colourFamily(item.colourHex)]);
  const colour = colourName && (
    <span className="flex items-center gap-2">
      {item.colourHex && <Swatch hex={item.colourHex} />}
      {colourName}
    </span>
  );

  const rows: [string, React.ReactNode][] = [
    ["Category", item.category && formatCategory(item.category)],
    ["Brand", item.brand],
    ["Colour", colour],
    ["Material", item.material],
    ["Acquired", item.acquired && formatMonthYear(item.acquired)],
    ["From", item.acquiredFrom],
    ["Price", item.price !== undefined ? formatPrice(item.price) : undefined],
    ["Size", item.size],
    ["Left", leftSummary(item)],
  ];
  const filled = rows.filter(([, value]) => value);

  // In the category's own order (as on the edit form), then any others,
  // showing only those that were measured.
  const order = [
    ...measurementRows(item.category),
    ...(Object.keys(measurementLabels) as MeasurementKey[]),
  ].filter((key, index, all) => all.indexOf(key) === index);
  const measured = order.flatMap((key) => {
    const cm = item.measurements?.[key];
    return cm ? [[measurementLabels[key], formatMeasurement(cm, unit)] as const] : [];
  });

  return (
    <>
      {filled.length > 0 && (
        <section className="mt-8">
          <h3 className="text-label text-stone uppercase">Details</h3>
          <DetailsList rows={filled} />
        </section>
      )}

      {measured.length > 0 && (
        <section className="mt-8">
          <div className="flex items-baseline justify-between">
            <h3 className="text-label text-stone uppercase">Measurements</h3>
            <UnitSwitch value={unit} onChange={onUnitChange} />
          </div>
          <DetailsList rows={measured} />
        </section>
      )}

      {item.notes && (
        <section className="mt-8">
          <h3 className="text-label text-stone uppercase">Notes</h3>
          <p className="mt-2 font-serif text-notes whitespace-pre-line">{item.notes}</p>
        </section>
      )}
    </>
  );
}

function DetailsList({ rows }: { rows: readonly (readonly [string, React.ReactNode])[] }) {
  return (
    <dl className="mt-2 border-t border-rule">
      {rows.map(([label, value]) => (
        <div key={label} className="grid grid-cols-2 gap-4 border-b border-rule py-2">
          <dt className="text-label text-stone uppercase">{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
