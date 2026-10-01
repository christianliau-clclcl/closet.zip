-- Milestone 11a: the colour itself, alongside the colour name people type.
-- Detected from the cover photo in the browser (11b) or picked by tapping
-- the garment; empty until then. Always "#" plus 6 lowercase hex digits,
-- so the same colour is never stored two ways. The colour family (blue,
-- grey…) is worked out from it in the app, not stored.
-- No new privacy rules needed: it's a column on items, which already only
-- lets you change your own rows.

alter table public.items
  add column colour_hex text check (colour_hex ~ '^#[0-9a-f]{6}$');
