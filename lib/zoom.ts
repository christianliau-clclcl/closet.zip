// Grid zoom levels, following the "Grid & zoom levels" table in DESIGN.md.
// Class names are written out in full so Tailwind can find them.

export const zoomLevels = ["small", "medium", "large"] as const;

export type Zoom = (typeof zoomLevels)[number];

type ZoomStyle = {
  columns: string; // mobile columns, then desktop columns
  rowCell: string; // a cell's width in a category row (ROWS view): the same as
  // a grid cell, i.e. (full width − the 8px gaps between cells) ÷ columns
  padding: string;
  sizes: string; // tells the browser how wide each image will display
  showName: boolean; // the item's name under the garment
};

export const zoomStyles: Record<Zoom, ZoomStyle> = {
  small: {
    columns: "grid-cols-4 md:grid-cols-10",
    rowCell: "basis-[calc((100%-24px)/4)] md:basis-[calc((100%-72px)/10)]",
    padding: "p-2",
    sizes: "(min-width: 768px) 10vw, 25vw",
    showName: false,
  },
  medium: {
    columns: "grid-cols-3 md:grid-cols-6",
    rowCell: "basis-[calc((100%-16px)/3)] md:basis-[calc((100%-40px)/6)]",
    padding: "p-4",
    sizes: "(min-width: 768px) 17vw, 33vw",
    showName: false,
  },
  large: {
    columns: "grid-cols-1 md:grid-cols-3",
    rowCell: "basis-full md:basis-[calc((100%-16px)/3)]",
    padding: "p-12",
    sizes: "(min-width: 768px) 33vw, 100vw",
    showName: true,
  },
};
