import ItemGrid from "@/components/ItemGrid";
import Swatch from "@/components/Swatch";
import { twoDigits } from "@/lib/folder-tree";
import { byBrand, byColourName, type Group } from "@/lib/overview";
import type { Item } from "@/lib/types";
import type { Zoom } from "@/lib/zoom";

type OverviewProps = {
  items: Item[]; // what you own now
  zoom: Zoom;
  onOpen: (id: string) => void;
  onPreview: (id: string | null, anchor?: HTMLElement) => void;
};

// The OVERVIEW tab (Milestone 14): summaries of what you own now, one section
// each, made from the pieces themselves in simple grids: By colour (the
// colour names you typed) and Brands (most-owned first). Archived pieces
// aren't included, and search and filters don't apply here.
export default function Overview({ items, zoom, onOpen, onPreview }: OverviewProps) {
  const grids = { zoom, onOpen, onPreview };
  return (
    <div className="flex flex-col gap-16">
      <h1 className="sr-only">Overview</h1>
      <Groups title="By colour" groups={byColourName(items)} {...grids} />
      <Groups title="Brands" groups={byBrand(items)} {...grids} />
    </div>
  );
}

type GroupsProps = Omit<OverviewProps, "items"> & { title: string; groups: Group[] };

// One section: its title, then each group's heading ("BLACK — 02", with a
// swatch for colours) and its pieces in a wrapping grid.
function Groups({ title, groups, zoom, onOpen, onPreview }: GroupsProps) {
  return (
    <section aria-label={title}>
      <h2 className="text-label text-stone uppercase">{title}</h2>
      <div className="mt-4 flex flex-col gap-12">
        {groups.map((group) => (
          <section key={group.key} aria-label={group.label}>
            <h3 className="mb-2 flex items-center gap-2 border-b border-rule pb-2 text-label uppercase">
              {group.swatch && <Swatch hex={group.swatch} />}
              {group.label} — {twoDigits(group.items.length)}
            </h3>
            <ItemGrid items={group.items} zoom={zoom} onOpen={onOpen} onPreview={onPreview} />
          </section>
        ))}
      </div>
    </section>
  );
}
