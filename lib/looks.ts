import { createClient } from "@/lib/supabase/server";
import type { Look } from "@/lib/types";

// The logged-in person's looks (Milestone 17), with their boards. Row Level
// Security already limits the query to their own rows. In your order: new
// ones (no place yet) first, newest first, as with folders.
export async function getMyLooks(): Promise<Look[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("looks")
    .select("id, name, note, position, is_hidden, created_at, look_items(item_id, x, y, width, rotation, layer)");
  if (error) throw error;

  return [...data]
    .sort((a, b) =>
      a.position === null || b.position === null
        ? a.position === b.position
          ? b.created_at.localeCompare(a.created_at)
          : a.position === null
            ? -1
            : 1
        : a.position - b.position,
    )
    .map((row) => ({
      id: row.id,
      name: row.name,
      note: row.note?.trim() || undefined,
      hidden: row.is_hidden || undefined,
      pieces: [...row.look_items]
        .sort((a, b) => a.layer - b.layer)
        .map((p) => ({ itemId: p.item_id, x: p.x, y: p.y, width: p.width, rotation: p.rotation, layer: p.layer })),
    }));
}
