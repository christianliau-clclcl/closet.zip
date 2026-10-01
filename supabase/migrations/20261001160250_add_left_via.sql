-- Milestone 6, step 2: how an archived piece left the closet (optional).
-- Decided 2026-10-01 (PRODUCT.md open questions). Only meaningful for
-- archived items; un-archiving clears it along with the archived date.
-- No new privacy rules needed: it's a column on items, which already only
-- lets you change your own rows.

alter table public.items
  add column left_via text check (left_via in ('sold', 'donated', 'gifted', 'lost', 'other'));
