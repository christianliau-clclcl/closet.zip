import { createClient } from "@/lib/supabase/client";
import type { LookPiece } from "@/lib/types";

// Changing looks from the browser (Milestone 17). Row Level Security and the
// database's checks make sure only your own looks, with your own pieces, change.

export const MAX_LOOK_NAME = 60;
export const MAX_LOOK_NOTE = 500;

// Makes a look and saves its board in one go. Returns the new look's ID.
export async function createLook(name: string, note: string, pieces: LookPiece[]): Promise<string> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("looks")
    .insert({ name: name.trim(), note: note.trim() || null })
    .select("id")
    .single();
  if (error) throw error;
  await saveLookBoard(data.id, pieces);
  return data.id;
}

// Replaces the board's pieces with these, all or nothing (save_look_board).
export async function saveLookBoard(lookId: string, pieces: LookPiece[]): Promise<void> {
  const { error } = await createClient().rpc("save_look_board", {
    p_look_id: lookId,
    p_pieces: pieces.map((p) => ({
      item_id: p.itemId,
      x: p.x,
      y: p.y,
      width: p.width,
      rotation: p.rotation,
      layer: p.layer,
    })),
  });
  if (error) throw error;
}

export async function updateLook(lookId: string, name: string, note: string): Promise<void> {
  const { error } = await createClient()
    .from("looks")
    .update({ name: name.trim(), note: note.trim() || null })
    .eq("id", lookId);
  if (error) throw error;
}

// The pieces themselves are never touched.
export async function deleteLook(lookId: string): Promise<void> {
  const { error } = await createClient().from("looks").delete().eq("id", lookId);
  if (error) throw error;
}
