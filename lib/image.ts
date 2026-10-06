// Resizing photos in the browser before upload (CLAUDE.md: Images).
// Uses the browser's own canvas, no library. Transparency is always kept:
// the output is WebP, or PNG in browsers that can't create WebP files.

export const FULL_SIZE = 1600; // longest side, for the overlay
export const THUMB_SIZE = 600; // longest side, for the grid

export type ResizedImage = {
  blob: Blob;
  extension: "webp" | "png";
};

// Reads an image file so it can be drawn. Throws if the file isn't an image
// the browser understands.
export async function loadImage(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    return image;
  } finally {
    URL.revokeObjectURL(url);
  }
}

// Scales the image down so its longest side is at most maxSize (never up),
// then saves it as WebP, falling back to PNG.
export async function resizeImage(image: HTMLImageElement, maxSize: number): Promise<ResizedImage> {
  const scale = Math.min(1, maxSize / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(image.naturalWidth * scale);
  canvas.height = Math.round(image.naturalHeight * scale);

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas not available");
  context.imageSmoothingQuality = "high";
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  const webp = await toBlob(canvas, "image/webp", 0.85);
  // Browsers that can't make WebP quietly return a PNG instead; check which we got.
  if (webp?.type === "image/webp") return { blob: webp, extension: "webp" };

  const png = webp?.type === "image/png" ? webp : await toBlob(canvas, "image/png");
  if (!png) throw new Error("Couldn't encode image");
  return { blob: png, extension: "png" };
}

// A quarter turn (18b): 1 = clockwise ↻, -1 = anticlockwise ↺. Saved as
// PNG, which loses nothing and keeps transparency; saving resizes it as usual.
export async function rotateImage(file: File, turn: 1 | -1): Promise<File> {
  const image = await loadImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalHeight; // a quarter turn swaps width and height
  canvas.height = image.naturalWidth;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas not available");
  context.translate(canvas.width / 2, canvas.height / 2);
  context.rotate((turn * Math.PI) / 2);
  context.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2);
  const png = await toBlob(canvas, "image/png");
  if (!png) throw new Error("Couldn't encode image");
  const name = file.name.replace(/\.[^.]+$/, "") || "photo";
  return new File([png], `${name}.png`, { type: "image/png" });
}

// A saved photo (a signed link) as a file, to turn it or cut it out.
export async function photoFile(src: string, name = "photo"): Promise<File> {
  const response = await fetch(src);
  if (!response.ok) throw new Error("Couldn't load the photo");
  const blob = await response.blob();
  return new File([blob], name, { type: blob.type });
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

// Where the picture actually sits inside an <img> drawn with object-contain
// and the same padding on every side, in screen coordinates. The <img> box is
// bigger than the picture: the padding and the empty bands around it belong
// to the box too. Null until the image has loaded.
export function containedBox(img: HTMLImageElement): DOMRect | null {
  if (!img.naturalWidth || !img.naturalHeight) return null;
  const box = img.getBoundingClientRect();
  const padding = parseFloat(getComputedStyle(img).paddingLeft);
  const scale = Math.min(
    (box.width - 2 * padding) / img.naturalWidth,
    (box.height - 2 * padding) / img.naturalHeight,
  );
  const width = img.naturalWidth * scale;
  const height = img.naturalHeight * scale;
  return new DOMRect(box.left + (box.width - width) / 2, box.top + (box.height - height) / 2, width, height);
}
