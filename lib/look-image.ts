import type { Item, LookPiece } from "@/lib/types";

// SAVE IMAGE on a look (Milestone 18b, decided 2026-10-06): the board only,
// on its white background, redrawn in the browser at 1200 × 1600 (the
// board's 3:4) from the saved positions, sizes, turns and layers, with each
// piece's full-size photo. Signed photo links allow reading pixels
// (crossOrigin "anonymous", as colour detection does), so the canvas can be
// saved. Transparent photos stay transparent over the white.

export const LOOK_IMAGE = { width: 1200, height: 1600 };
const WHITE = "#ffffff"; // the board's `cell` colour

function loadPhoto(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("A photo couldn't be loaded"));
    image.src = src;
  });
}

export async function renderLookImage(pieces: LookPiece[], items: Map<string, Item>): Promise<Blob> {
  const { width, height } = LOOK_IMAGE;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("This browser can't draw images");
  context.fillStyle = WHITE;
  context.fillRect(0, 0, width, height);

  // Bottom layer first, so the stack matches the board.
  const shown = [...pieces].sort((a, b) => a.layer - b.layer).filter((piece) => items.has(piece.itemId));
  const photos = await Promise.all(shown.map((piece) => loadPhoto(items.get(piece.itemId)!.hero.src)));

  shown.forEach((piece, index) => {
    const photo = photos[index];
    const w = piece.width * width;
    const h = w * (photo.naturalHeight / photo.naturalWidth); // the height follows the photo
    context.save();
    context.translate(piece.x * width, piece.y * height);
    context.rotate((piece.rotation * Math.PI) / 180);
    context.drawImage(photo, -w / 2, -h / 2, w, h);
    context.restore();
  });

  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("The image couldn't be made"))), "image/png"),
  );
}

// "Winter uniform" → "winter-uniform.png"
export function lookImageName(name: string): string {
  const slug = name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .slice(0, 60);
  return `${slug || "look"}.png`;
}
