import { FULL_SIZE, loadImage, resizeImage } from "@/lib/image";

// REMOVE BACKGROUND on Add (decided 2026-10-06): @imgly/background-removal
// cuts the garment out on the person's own device, so photos never leave
// it. Only the model is downloaded, from IMG.LY's servers, the first time
// it's used (the small ~40 MB "isnet_quint8"), then the browser keeps it.
// The library is AGPL-3.0, so Closet.zip is too (LICENSE.md).
//
// The library is loaded only when the button is pressed, so it adds
// nothing to ordinary page loads. Big photos are first shrunk to the size
// we save anyway (1600px), which makes the cut-out much faster on phones.
// It runs single-threaded: the faster multi-threaded mode needs page headers
// that would also stop Supabase photos from loading.

export type RemovalProgress = { stage: "downloading"; percent: number } | { stage: "removing" };

export async function removePhotoBackground(file: File, onProgress: (progress: RemovalProgress) => void): Promise<File> {
  const { removeBackground } = await import("@imgly/background-removal");
  const smaller = await resizeImage(await loadImage(file), FULL_SIZE);

  // The model and engine arrive as several files: show their combined share.
  const downloads = new Map<string, { current: number; total: number }>();
  const blob = await removeBackground(smaller.blob, {
    model: "isnet_quint8",
    output: { format: "image/png" }, // keeps the new transparent background
    progress: (key, current, total) => {
      if (key.startsWith("fetch")) {
        downloads.set(key, { current, total });
        const all = [...downloads.values()];
        const done = all.reduce((sum, d) => sum + d.current, 0);
        const size = all.reduce((sum, d) => sum + d.total, 0);
        onProgress({ stage: "downloading", percent: size > 0 ? Math.round((done / size) * 100) : 0 });
      } else {
        onProgress({ stage: "removing" });
      }
    },
  });

  const name = file.name.replace(/\.[^.]+$/, "") || "photo";
  return new File([blob], `${name}-cut-out.png`, { type: "image/png" });
}
