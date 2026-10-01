"use client";

import { AnimatePresence, MotionConfig, motion } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { layoutTransition } from "@/lib/motion";
import type { Photo } from "@/lib/types";

type PhotoViewerProps = {
  photos: Photo[]; // display order, hero first
  title: string; // for alt text
};

const SWIPE_DISTANCE = 40; // px of horizontal movement that counts as a swipe

// Moving between photos slides them like a strip of film: the new photo comes
// in from the side you're heading to (direction 1 = next, from the right) and
// the old one leaves the other way.
const slide = {
  enter: (direction: number) => ({ x: `${direction * 100}%` }),
  centre: { x: "0%" },
  exit: (direction: number) => ({ x: `${direction * -100}%` }),
};

// The garment side of the detail overlay. With several photos: bare dots
// under the garment (tap or click to switch), swipe left/right on phones, and
// on desktop ← → buttons beside the garment plus the ← → keys. One photo: just the garment, no dots.
// Photos slide in the direction you're moving (instantly with Reduce motion).
// Clicks on the empty space around the garment still close the overlay
// (data-scrim), except at the end of a swipe.
export default function PhotoViewer({ photos, title }: PhotoViewerProps) {
  // Which photo, and which way we last moved (1 = next, -1 = previous), so the
  // slide follows the swipe even when wrapping from the last photo to the first.
  const [[index, direction], setPage] = useState([0, 0]);
  const start = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);
  const count = photos.length;
  const photo = photos[index];

  function go(step: number) {
    setPage(([current]) => [(current + step + count) % count, step]);
  }

  // ← → keys, unless you're typing in a field (e.g. the archive form's year).
  useEffect(() => {
    if (count < 2) return;
    function onKey(event: KeyboardEvent) {
      const target = event.target;
      if (target instanceof Element && target.closest("input, textarea, select")) return;
      if (event.key === "ArrowRight") setPage(([i]) => [(i + 1) % count, 1]);
      if (event.key === "ArrowLeft") setPage(([i]) => [(i - 1 + count) % count, -1]);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [count]);

  // Load the other photos in the background, so switching is instant.
  useEffect(() => {
    photos.slice(1).forEach((p) => {
      const preload = new window.Image();
      preload.src = p.src;
    });
  }, [photos]);

  return (
    <div
      data-scrim
      // On desktop this area is a size "container", so the dots can be placed
      // just under the photo box (see below) whatever the screen size.
      // overflow-hidden: photos sliding in and out stay inside this area.
      className="relative aspect-square w-full touch-pan-y overflow-hidden md:aspect-auto md:h-full md:flex-1 md:[container-type:size]"
      onPointerDown={(event) => {
        start.current = { x: event.clientX, y: event.clientY };
        swiped.current = false;
      }}
      onPointerUp={(event) => {
        if (!start.current || count < 2) return;
        const dx = event.clientX - start.current.x;
        const dy = event.clientY - start.current.y;
        start.current = null;
        // Mostly sideways and far enough: a swipe. Left = next photo.
        if (Math.abs(dx) > SWIPE_DISTANCE && Math.abs(dx) > Math.abs(dy)) {
          swiped.current = true;
          go(dx < 0 ? 1 : -1);
        }
      }}
      // The click that ends a swipe shouldn't count as a click on the scrim.
      onClickCapture={(event) => {
        if (swiped.current) {
          event.stopPropagation();
          swiped.current = false;
        }
      }}
    >
      {/* initial={false}: the first photo is simply there when the overlay opens. */}
      <MotionConfig transition={layoutTransition} reducedMotion="user">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={photo.src}
            custom={direction}
            variants={slide}
            initial="enter"
            animate="centre"
            exit="exit"
            className="absolute inset-0"
          >
            <Image
              src={photo.src}
              alt={count > 1 ? `${title}, photo ${index + 1} of ${count}` : title}
              fill
              sizes="(min-width: 768px) 60vw, 100vw"
              unoptimized={photo.unoptimized}
              draggable={false}
              className="object-contain p-12 select-none md:p-8"
            />
          </motion.div>
        </AnimatePresence>
      </MotionConfig>

      {count > 1 && (
        // Desktop only: ← → buttons in the padding either side of the photo
        // box, whose edges are at 50% ± min(50cqw, 50cqh) (see the dots below).
        // Square canvas buttons like the ✕, so they read on the dark scrim.
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous photo"
            className="absolute top-1/2 left-[calc(50%-min(50cqw,50cqh))] hidden size-8 -translate-y-1/2 cursor-pointer items-center justify-center bg-canvas focus-visible:outline-1 focus-visible:outline-ink md:flex"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next photo"
            className="absolute top-1/2 right-[calc(50%-min(50cqw,50cqh))] hidden size-8 -translate-y-1/2 cursor-pointer items-center justify-center bg-canvas focus-visible:outline-1 focus-visible:outline-ink md:flex"
          >
            →
          </button>
        </>
      )}

      {count > 1 && (
        // Phones: in the padding under the photo. Desktop: just under the photo
        // box, which is centred and min(width, height) - 2 × 32px padding big;
        // its bottom edge is at 50% + min(50cqw, 50cqh) - 32px, plus 8px of air.
        <div className="absolute inset-x-0 bottom-2 flex justify-center md:top-[calc(50%+min(50cqw,50cqh)-24px)] md:bottom-auto">
          {photos.map((p, i) => (
            <button
              key={p.id ?? p.src}
              type="button"
              onClick={() => setPage([i, Math.sign(i - index)])}
              aria-label={`Photo ${i + 1} of ${count}`}
              aria-current={i === index ? "true" : undefined}
              className="flex size-6 cursor-pointer items-center justify-center"
            >
              {/* Inactive: pebble on the phone's canvas page, canvas on the darker desktop scrim. */}
              <span className={`size-2 rounded-full ${i === index ? "bg-ink" : "bg-pebble md:bg-canvas"}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
