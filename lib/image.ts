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

function toBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}
