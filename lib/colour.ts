// A garment's colour, read from its photo in the browser (Milestone 11).
// Uses the browser's own canvas, no library. Transparent pixels (the removed
// background) are ignored, so background-removed PNGs work best.

const SAMPLE_SIZE = 64; // detection looks at a small copy: fast, and enough
const MIN_ALPHA = 128; // fainter pixels count as background
// A pixel counts as "colourful" above this saturation (0–1) and brightness;
// below it, it's a neutral: black, grey, white or a washed-out beige.
const MIN_SATURATION = 0.2;
const MIN_BRIGHTNESS = 40; // 0–255; very dark pixels have unreliable colour
// If at least this share of the garment is colourful, its colour wins over
// bigger neutral areas (white soles, grey linings…).
const MIN_COLOURFUL_SHARE = 0.15;

// Loads a photo so its pixels can be read. crossOrigin lets the browser read
// photos from Supabase Storage (a different address) as well as local ones.
export async function loadImageFromUrl(src: string): Promise<HTMLImageElement> {
  const image = new Image();
  image.crossOrigin = "anonymous";
  image.src = src;
  await image.decode();
  return image;
}

// The garment's main colour as "#rrggbb", or null when the photo is all
// background. Similar pixels are grouped and the biggest group wins,
// preferring a real colour when enough of the garment has one.
export function detectColour(image: HTMLImageElement): string | null {
  const scale = Math.min(1, SAMPLE_SIZE / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const pixels = readPixels(image, width, height, 0, 0, width, height);

  const all = new Map<number, Group>();
  const colourful = new Map<number, Group>();
  let opaque = 0;
  let colourfulCount = 0;

  for (let i = 0; i < pixels.length; i += 4) {
    const [r, g, b, a] = [pixels[i], pixels[i + 1], pixels[i + 2], pixels[i + 3]];
    if (a < MIN_ALPHA) continue;
    opaque++;
    // Group by the top 4 bits of each channel: 4096 groups of similar colours.
    const key = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4);
    addTo(all, key, r, g, b);
    const brightest = Math.max(r, g, b);
    const saturation = brightest ? (brightest - Math.min(r, g, b)) / brightest : 0;
    if (saturation >= MIN_SATURATION && brightest >= MIN_BRIGHTNESS) {
      addTo(colourful, key, r, g, b);
      colourfulCount++;
    }
  }

  if (opaque === 0) return null;
  const groups = colourfulCount / opaque >= MIN_COLOURFUL_SHARE ? colourful : all;
  const biggest = [...groups.values()].reduce((a, b) => (b.count > a.count ? b : a));
  return toHex(biggest.r / biggest.count, biggest.g / biggest.count, biggest.b / biggest.count);
}

// The colour at one point of the photo (in the photo's own pixels), averaged
// over a small square so a single stray pixel doesn't decide. Null when the
// point is on the transparent background.
export function sampleColour(image: HTMLImageElement, x: number, y: number): string | null {
  const radius = Math.max(2, Math.round(Math.max(image.naturalWidth, image.naturalHeight) / 200));
  const left = Math.max(0, Math.round(x) - radius);
  const top = Math.max(0, Math.round(y) - radius);
  const size = radius * 2 + 1;
  const pixels = readPixels(image, image.naturalWidth, image.naturalHeight, left, top, size, size);

  const sum = { r: 0, g: 0, b: 0, count: 0 };
  for (let i = 0; i < pixels.length; i += 4) {
    if (pixels[i + 3] < MIN_ALPHA) continue;
    sum.r += pixels[i];
    sum.g += pixels[i + 1];
    sum.b += pixels[i + 2];
    sum.count++;
  }
  // Mostly background: the tap missed the garment.
  if (sum.count < (size * size) / 2) return null;
  return toHex(sum.r / sum.count, sum.g / sum.count, sum.b / sum.count);
}

type Group = { count: number; r: number; g: number; b: number };

function addTo(groups: Map<number, Group>, key: number, r: number, g: number, b: number) {
  const group = groups.get(key) ?? { count: 0, r: 0, g: 0, b: 0 };
  group.count++;
  group.r += r;
  group.g += g;
  group.b += b;
  groups.set(key, group);
}

// Draws the image at width × height and returns the RGBA values of one area.
// Throws if the browser won't share the pixels (a photo from another address
// without permission); callers treat that as "couldn't read the colour".
function readPixels(
  image: HTMLImageElement,
  width: number,
  height: number,
  left: number,
  top: number,
  areaWidth: number,
  areaHeight: number,
): Uint8ClampedArray {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Canvas not available");
  context.drawImage(image, 0, 0, width, height);
  return context.getImageData(left, top, areaWidth, areaHeight).data;
}

function toHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
}

// ---------------------------------------------------------------------------
// Colour families: broad groups worked out from a colour, for filtering and
// for the colour order (PRODUCT.md "Colour order"). Never stored.

// In gradient order: the colours around the wheel, then the neutrals.
export const families = [
  "red",
  "orange",
  "yellow",
  "green",
  "blue",
  "purple",
  "pink",
  "brown",
  "white",
  "grey",
  "black",
] as const;
export type Family = (typeof families)[number];

export const familyLabels: Record<Family, string> = {
  red: "Red",
  orange: "Orange",
  yellow: "Yellow",
  green: "Green",
  blue: "Blue",
  purple: "Purple",
  pink: "Pink",
  brown: "Beige & brown",
  white: "White",
  grey: "Grey",
  black: "Black",
};

// Hue (0–360° around the colour wheel), saturation (0–1: how colourful) and
// value (0–1: how bright) of a "#rrggbb" colour.
export function toHsv(hex: string): { hue: number; saturation: number; value: number } {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const max = Math.max(r, g, b);
  const range = max - Math.min(r, g, b);
  let hue = 0;
  if (range > 0) {
    if (max === r) hue = ((g - b) / range) % 6;
    else if (max === g) hue = (b - r) / range + 2;
    else hue = (r - g) / range + 4;
    hue = (hue * 60 + 360) % 360;
  }
  return { hue, saturation: max ? range / max : 0, value: max / 255 };
}

export function colourFamily(hex: string): Family {
  const { hue, saturation, value } = toHsv(hex);
  // Too dark to have a colour of its own.
  if (value < 0.12) return "black";
  // Barely any colour: a neutral, by brightness.
  if (saturation < 0.1) return value < 0.18 ? "black" : value > 0.85 ? "white" : "grey";
  // Warm and muted or dark: khaki, stone, camel, chocolate.
  if (hue >= 15 && hue < 50 && (saturation < 0.45 || value < 0.55)) return "brown";
  // Light, soft reds read as pink.
  if ((hue < 15 || hue >= 345) && saturation < 0.4 && value > 0.7) return "pink";
  if (hue < 15 || hue >= 345) return "red";
  if (hue < 40) return "orange";
  // Dark yellows are olive, which reads as green in clothes.
  if (hue < 70) return value < 0.6 ? "green" : "yellow";
  if (hue < 170) return "green";
  if (hue < 260) return "blue";
  if (hue < 300) return "purple";
  // Magentas: light ones are pink; dark ones are wine reds or plums.
  if (value < 0.6) return hue >= 325 ? "red" : "purple";
  return "pink";
}

// The average of several "#rrggbb" colours: a family's swatch in the filter
// drawer, made from the person's own pieces rather than an invented colour.
export function averageColour(hexes: string[]): string {
  const sum = [0, 0, 0];
  for (const hex of hexes) [1, 3, 5].forEach((i, c) => (sum[c] += parseInt(hex.slice(i, i + 2), 16)));
  return toHex(sum[0] / hexes.length, sum[1] / hexes.length, sum[2] / hexes.length);
}
