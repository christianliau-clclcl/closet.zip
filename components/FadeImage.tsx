"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

// A next/image that fades in once its file has loaded, instead of popping in.
// Same timing as the rest of the app (DESIGN.md "Motion", lib/motion.ts), done
// in CSS since it's only opacity. Instant for anyone with Reduce motion on.
export default function FadeImage({ className = "", onLoad, alt, ...props }: ImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <Image
      {...props}
      alt={alt}
      onLoad={(event) => {
        setLoaded(true);
        onLoad?.(event);
      }}
      className={`${className} transition-opacity duration-400 ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none ${loaded ? "opacity-100" : "opacity-0"}`}
    />
  );
}
