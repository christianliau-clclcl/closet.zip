// The closet's name (friend feedback, 2026-10-02): what replaces CLOSET.ZIP
// in the top left when logged in. Optional, any characters, 1–30 long.
// Stored in the account's own details (Supabase "user metadata"), so it's
// set at sign-up, before the email is even confirmed, and needs no table.

export const MAX_CLOSET_NAME = 30;

// Characters as people count them: an emoji is one, not two.
export function closetNameLength(name: string): number {
  return [...name.trim()].length;
}

// The name tidied for saving, or null for none (empty means "no name").
// Throws a message for one that's too long.
export function checkClosetName(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return null;
  if (closetNameLength(trimmed) > MAX_CLOSET_NAME) {
    throw new Error(`Keep it to ${MAX_CLOSET_NAME} characters.`);
  }
  return trimmed;
}

// Reads the name from a logged-in person's details (their login claims).
export function closetNameFrom(claims: { user_metadata?: unknown } | undefined): string | undefined {
  const metadata = claims?.user_metadata as { closet_name?: unknown } | undefined;
  const name = metadata?.closet_name;
  return typeof name === "string" && name.trim() ? name.trim() : undefined;
}
