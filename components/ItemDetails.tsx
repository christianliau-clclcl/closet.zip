import { formatCategory, formatMonthYear, formatPrice, leftSummary } from "@/lib/format";
import type { Item } from "@/lib/types";

// The details panel content: a list of label / value rows separated by rule
// lines, then the user's notes in Fraunces. Empty fields are left out, and a
// section with nothing in it isn't shown at all.
export default function ItemDetails({ item }: { item: Item }) {
  const rows: [string, string | undefined][] = [
    ["Category", item.category && formatCategory(item.category)],
    ["Brand", item.brand],
    ["Colour", item.colour],
    ["Material", item.material],
    ["Acquired", item.acquired && formatMonthYear(item.acquired)],
    ["From", item.acquiredFrom],
    ["Price", item.price !== undefined ? formatPrice(item.price) : undefined],
    ["Left", leftSummary(item)],
  ];
  const filled = rows.filter(([, value]) => value);

  return (
    <>
      {filled.length > 0 && (
        <section className="mt-8">
          <h3 className="text-label text-stone uppercase">Details</h3>
          <dl className="mt-2 border-t border-rule">
            {filled.map(([label, value]) => (
              <div key={label} className="grid grid-cols-2 gap-4 border-b border-rule py-2">
                <dt className="text-label text-stone uppercase">{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
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
