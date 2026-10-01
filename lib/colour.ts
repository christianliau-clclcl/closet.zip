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
