-- Milestone 5, step 4: each photo is saved in two sizes. storage_path is the
-- full version (up to 1600px, for the overlay); thumb_path is a small version
-- (up to 600px) so the grid loads quickly on phones.
-- Optional so a photo without a thumbnail still works (the grid falls back
-- to the full version). Both files live in the owner's folder, so the
-- existing storage rules already cover them.

alter table public.item_photos
  add column thumb_path text unique;
