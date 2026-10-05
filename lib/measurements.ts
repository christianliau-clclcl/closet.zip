import { categoryInfo } from "@/lib/categories";
import type { Category } from "@/lib/types";

// Garment measurements (PRODUCT.md "Item data"). Stored in centimetres;
// shown and entered in each person's unit. Rounded to tape-measure
// precision: the nearest 0.5 cm or ¼ in.

export type Unit = "cm" | "in";

export const measurementLabels = {
  chest: "Chest (pit to pit)",
  length: "Length",
  shoulder: "Shoulder",
  sleeve: "Sleeve",
  waist: "Waist",
  rise: "Rise",
  inseam: "Inseam",
  leg_opening: "Leg opening",
  width: "Width",
  height: "Height",
  depth: "Depth",
} as const;

export type MeasurementKey = keyof typeof measurementLabels;
export type Measurements = Partial<Record<MeasurementKey, number>>; // in cm

const topRows: MeasurementKey[] = ["chest", "length", "shoulder", "sleeve"];

// Which rows a piece gets, by its category's set (lib/categories.ts). No
// category yet: the top rows.
export function measurementRows(category: Category | "" | undefined): MeasurementKey[] {
  switch (category ? categoryInfo[category]?.measurements : "top") {
    case "bottom":
      return ["waist", "rise", "inseam", "leg_opening", "length"];
    case "object":
      return ["width", "height", "depth"];
    case "none":
      return []; // the size label covers shoes
    default:
      return topRows;
  }
}

const CM_PER_INCH = 2.54;

// A stored centimetre value in the given unit, rounded for display.
export function fromCm(cm: number, unit: Unit): number {
  return unit === "cm" ? Math.round(cm * 2) / 2 : Math.round((cm / CM_PER_INCH) * 4) / 4;
}

// A value in the given unit, converted to centimetres for storing
// (to one decimal place, so converting back gives the same number).
export function toCm(value: number, unit: Unit): number {
  return Math.round((unit === "cm" ? value : value * CM_PER_INCH) * 10) / 10;
}

const fractions: Record<string, number> = { "¼": 0.25, "½": 0.5, "¾": 0.75 };
const fractionGlyphs: Record<number, string> = { 0.25: "¼", 0.5: "½", 0.75: "¾" };

// For display: 22.25 in → "22¼ in"; 56.5 cm → "56.5 cm".
export function formatMeasurement(cm: number, unit: Unit): string {
  const value = fromCm(cm, unit);
  if (unit === "cm") return `${value} cm`;
  const whole = Math.floor(value);
  const glyph = fractionGlyphs[value - whole] ?? "";
  // "22¼", "22", or just "¾" for under an inch.
  const number = whole === 0 && glyph ? glyph : `${whole}${glyph}`;
  return `${number} in`;
}

// Understands "22.25", "22,25", "22 1/4", "22¼" and "1/2". Returns null for
// anything that isn't a positive number.
export function parseMeasurement(text: string): number | null {
  let t = text.trim().replace(",", ".");
  if (!t) return null;
  for (const [glyph, value] of Object.entries(fractions)) {
    if (t.endsWith(glyph)) t = `${t.slice(0, -1).trim() || "0"} ${value}`;
  }
  // "22 1/4" or "1/4"
  const mixed = t.match(/^(\d+(?:\.\d+)?)?\s*(?:(\d+)\/(\d+)|(0?\.\d+))?$/);
  if (!mixed) return null;
  const [, whole, num, den, decimal] = mixed;
  let value = whole ? Number(whole) : 0;
  if (num && den) {
    if (Number(den) === 0) return null;
    value += Number(num) / Number(den);
  }
  if (decimal) value += Number(decimal);
  return value > 0 && value < 1000 ? value : null;
}

// Reads the stored JSON safely: only known names with positive numbers.
export function readMeasurements(json: unknown): Measurements {
  if (!json || typeof json !== "object" || Array.isArray(json)) return {};
  const out: Measurements = {};
  for (const [key, value] of Object.entries(json)) {
    if (key in measurementLabels && typeof value === "number" && value > 0) {
      out[key as MeasurementKey] = value;
    }
  }
  return out;
}
