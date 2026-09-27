// Grid zoom levels, following the "Grid & zoom levels" table in DESIGN.md.
// Class names are written out in full so Tailwind can find them.

export const zoomLevels = ["small", "medium", "large"] as const;

export type Zoom = (typeof zoomLevels)[number];

// Which labels a cell shows: always, or only on hover / keyboard focus.
export type LabelVisibility = "always" | "hover" | "never";

type ZoomStyle = {
  columns: string; // mobile columns, then desktop columns
  padding: string;
  sizes: string; // tells the browser how wide each image will display
  code: LabelVisibility;
  name: LabelVisibility;
  brand: LabelVisibility;
};

export const zoomStyles: Record<Zoom, ZoomStyle> = {
  small: {
    columns: "grid-cols-4 md:grid-cols-10",
    padding: "p-2",
    sizes: "(min-width: 768px) 10vw, 25vw",
    code: "hover",
    name: "never",
    brand: "never",
  },
  medium: {
    columns: "grid-cols-3 md:grid-cols-6",
    padding: "p-4",
    sizes: "(min-width: 768px) 17vw, 33vw",
    code: "always",
    name: "hover",
    brand: "hover",
  },
  large: {
    columns: "grid-cols-1 md:grid-cols-3",
    padding: "p-12",
    sizes: "(min-width: 768px) 33vw, 100vw",
    code: "always",
    name: "always",
    brand: "hover",
  },
};
