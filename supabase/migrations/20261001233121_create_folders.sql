-- Milestone 12a: folders, and the hand-made "My order".
-- See "Folders" and the Milestone 12 decisions in PRODUCT.md.
--
-- Folders are personal collections on top of the fixed categories. A piece
-- can be in several folders (pieces are linked, never copied), and folders
-- can sit inside folders. Deleting a folder deletes the folders inside it,
-- but never pieces.

-- ===========================================================================
-- "Same owner" checks
-- ===========================================================================
-- The tables below point at items and folders by (id, user_id) together, so
-- the database itself refuses a link to someone else's piece or folder: the
-- pair only exists for your own rows. These unique keys make that possible.
alter table public.items add constraint items_id_user_id_key unique (id, user_id);

-- ===========================================================================
-- My order for the whole closet (ALL)
-- ===========================================================================
-- Empty until you arrange. Empty places sort first (newest first), so new
-- pieces show up at the start.
alter table public.items add column sort_position integer;

-- ===========================================================================
-- folders
-- ===========================================================================
create table public.folders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (length(trim(name)) between 1 and 60),
  -- The folder this one sits in; empty for a top-level folder.
  parent_id uuid,
  -- The cover: one of your pieces, or an image you uploaded (in the private
  -- item-photos bucket, at "<user id>/folders/<folder id>.<ext>"). Neither
  -- means the first piece in the folder is used.
  cover_item_id uuid,
  cover_path text unique check (cover_path ~ '^[0-9a-f-]{36}/folders/[0-9a-f-]{36}\.(webp|png)$'),
  -- Place among the folders next to it; empty for new ones (they sort first).
  position integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  constraint folders_not_own_parent check (parent_id <> id),
  -- The uploaded cover must be in your own storage folder.
  constraint folders_cover_path_is_own check (cover_path is null or cover_path like user_id::text || '/%'),
  -- The parent must be your own folder; deleting it deletes this one too.
  constraint folders_parent_fkey foreign key (parent_id, user_id)
    references public.folders (id, user_id) on delete cascade,
  -- The cover piece must be your own; deleting it just clears the cover.
  constraint folders_cover_item_fkey foreign key (cover_item_id, user_id)
    references public.items (id, user_id) on delete set null (cover_item_id)
);

create index folders_user_id_parent_id_idx on public.folders (user_id, parent_id);
create index folders_cover_item_id_idx on public.folders (cover_item_id);

create trigger folders_set_updated_at
  before update on public.folders
  for each row execute function public.set_updated_at();

-- A folder can't go inside itself, directly or through the folders inside it
-- (which would make a loop with no top). Checked whenever a parent is set.
create function public.prevent_folder_loops()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.parent_id is not null and exists (
    with recursive ancestors (id) as (
      select new.parent_id
      union
      select f.parent_id
      from public.folders f
      join ancestors a on f.id = a.id
      where f.parent_id is not null
    )
    select 1 from ancestors where id = new.id
  ) then
    raise exception 'A folder can''t go inside itself';
  end if;
  return new;
end;
$$;

create trigger folders_prevent_loops
  before insert or update of parent_id on public.folders
  for each row execute function public.prevent_folder_loops();

-- ===========================================================================
-- folder_items: which pieces are in which folders
-- ===========================================================================
create table public.folder_items (
  folder_id uuid not null,
  item_id uuid not null,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  -- Place in this folder's My order; empty for newly added pieces (first).
  position integer,
  created_at timestamptz not null default now(),
  primary key (folder_id, item_id),
  -- Both must be yours. Deleting the folder or the piece removes the link.
  constraint folder_items_folder_fkey foreign key (folder_id, user_id)
    references public.folders (id, user_id) on delete cascade,
  constraint folder_items_item_fkey foreign key (item_id, user_id)
    references public.items (id, user_id) on delete cascade
);

create index folder_items_item_id_idx on public.folder_items (item_id);
create index folder_items_user_id_idx on public.folder_items (user_id);

-- ===========================================================================
-- Privacy: Row Level Security, the same rules as items
-- ===========================================================================
-- You can only see, add, change and delete rows marked with your own ID.
-- Logged-out visitors get no policy, so they can't do anything.
alter table public.folders enable row level security;
alter table public.folder_items enable row level security;

create policy "Owners can view their folders"
  on public.folders for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "Owners can add folders"
  on public.folders for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "Owners can update their folders"
  on public.folders for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "Owners can delete their folders"
  on public.folders for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "Owners can view their folder links"
  on public.folder_items for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "Owners can add folder links"
  on public.folder_items for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "Owners can update their folder links"
  on public.folder_items for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "Owners can delete their folder links"
  on public.folder_items for delete to authenticated
  using ((select auth.uid()) = user_id);
