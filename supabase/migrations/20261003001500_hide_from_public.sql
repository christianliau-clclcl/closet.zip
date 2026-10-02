-- Milestone 15b: hiding pieces and folders from your public page.
-- Everything shows by default once a closet goes public; any piece, and any
-- folder, can be hidden. Hiding a folder hides only the folder: its pieces
-- still show in ALL unless they're hidden themselves (decided 2026-10-03).
--
-- No new policies: the existing owner-only rules on items and folders already
-- decide who can read and change these columns. Visitors can't read anything
-- yet; the public door (15c) will respect these switches.

alter table public.items add column is_hidden boolean not null default false;
alter table public.folders add column is_hidden boolean not null default false;
