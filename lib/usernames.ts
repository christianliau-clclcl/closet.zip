// Usernames for public profiles (Milestone 15a), the same rules as the
// database's: 3–20 letters, numbers, . and _, stored lowercase (so not
// case-sensitive), unique, and not one of a few reserved words.

export const RESERVED_USERNAMES = [
  "admin", "administrator", "add", "api", "auth", "login", "logout", "signup",
  "settings", "u", "items", "help", "support", "about", "closet", "closetzip",
  "forgot-password", "reset-password", "root", "me",
];

// What's typed, as it would be saved: trimmed, without a leading @, lowercase.
export function normaliseUsername(typed: string): string {
  return typed.trim().replace(/^@/, "").toLowerCase();
}

// A problem with a (normalised) username, or null if it's fine to check.
export function usernameProblem(name: string): string | null {
  if (!name) return null;
  if (!/^[a-z0-9._]{3,20}$/.test(name)) return "Use 3–20 letters, numbers, . or _";
  if (RESERVED_USERNAMES.includes(name)) return "That name is reserved.";
  return null;
}
