"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { detectColour, loadImageFromUrl } from "@/lib/colour";
import { createClient } from "@/lib/supabase/client";
import type { Item } from "@/lib/types";

// Milestone 11e: pieces saved before colours existed get one quietly. When
// the closet opens, each piece without a colour is detected from its grid
// thumbnail (the same detection as on Add) and saved, one at a time; then
// the closet refreshes so the colours show in filters and sorting.
// Only fills empty colours, so a colour picked meanwhile is never replaced.
export function useColourBackfill(items: Item[]) {
  const router = useRouter();
  const started = useRef(false);

  useEffect(() => {
    const missing = items.filter((item) => !item.colourHex);
    if (started.current || missing.length === 0) return;
    started.current = true; // once per visit, even if the items list changes

    (async () => {
      const supabase = createClient();
      let saved = 0;
      for (const item of missing) {
        try {
          const hex = detectColour(await loadImageFromUrl(item.hero.thumbSrc ?? item.hero.src));
          if (!hex) continue; // nothing to detect (all background): try again next visit
          const { error } = await supabase
            .from("items")
            .update({ colour_hex: hex })
            .eq("id", item.id)
            .is("colour_hex", null);
          if (!error) saved++;
        } catch {
          // Photo couldn't be read this time; it'll be tried on the next visit.
        }
      }
      if (saved > 0) router.refresh();
    })();
  }, [items, router]);
}
