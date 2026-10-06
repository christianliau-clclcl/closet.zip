-- Milestone 17a: looks (PRODUCT.md "Looks", planned 2026-10-06).
-- A look is a name, a note and some of your pieces composed on a freeform
-- board: each piece placed, sized, rotated and layered. Pieces are linked,
-- never copied. Deleting a look never touches its pieces; deleting a piece
-- removes it from its looks.

-- ===========================================================================
-- looks
-- ===========================================================================

create table public.looks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (length(trim(name)) between 1 and 60),
  note text check (length(note) <= 500),
  -- Place in your gallery; empty for new ones (they sort first).
  position integer,
  -- Left off your public page (17e).
  is_hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)
);

create index looks_user_id_idx on public.looks (user_id);

create trigger looks_set_updated_at
  before update on public.looks
  for each row execute function public.set_updated_at();

-- ===========================================================================
-- look_items: which pieces are on which board, and where
-- ===========================================================================
-- The board is a fixed 3:4 rectangle. Positions are fractions of it, so a
-- look looks the same at any size: x and y are the piece's centre (0 = left
-- or top edge, 1 = right or bottom; a little past the edge is allowed),
-- width is a fraction of the board's width (the height follows the photo),
-- rotation is in degrees, and a higher layer sits on top.

create table public.look_items (
  look_id uuid not null,
  item_id uuid not null,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  x real not null check (x between -0.5 and 1.5),
  y real not null check (y between -0.5 and 1.5),
  width real not null check (width between 0.05 and 1.5),
  rotation real not null default 0 check (rotation between -180 and 180),
  layer integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (look_id, item_id),
  -- Both must be yours. Deleting the look or the piece removes the link.
  constraint look_items_look_fkey foreign key (look_id, user_id)
    references public.looks (id, user_id) on delete cascade,
  constraint look_items_item_fkey foreign key (item_id, user_id)
    references public.items (id, user_id) on delete cascade
);

create index look_items_item_id_idx on public.look_items (item_id);
create index look_items_user_id_idx on public.look_items (user_id);

-- ===========================================================================
-- Privacy: Row Level Security, the same rules as folders
-- ===========================================================================
-- You can only see, add, change and delete rows marked with your own ID.
-- Logged-out visitors get no policy, so they can't do anything. (Public
-- pages will read looks through the public door, in 17e.)

alter table public.looks enable row level security;
alter table public.look_items enable row level security;

create policy "Owners can view their looks"
  on public.looks for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "Owners can add looks"
  on public.looks for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "Owners can update their looks"
  on public.looks for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "Owners can delete their looks"
  on public.looks for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "Owners can view their look pieces"
  on public.look_items for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "Owners can add look pieces"
  on public.look_items for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "Owners can update their look pieces"
  on public.look_items for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "Owners can delete their look pieces"
  on public.look_items for delete to authenticated
  using ((select auth.uid()) = user_id);

-- ===========================================================================
-- Saving a whole board at once
-- ===========================================================================
-- The editor (17c) saves every piece's place in one go: the board's pieces
-- are replaced by the ones given, all or nothing, so a look is never left
-- half-saved. p_pieces is a list like
-- [{"item_id": "…", "x": 0.5, "y": 0.3, "width": 0.4, "rotation": -6, "layer": 2}].
-- It runs with the caller's own rights (security invoker), so the rules
-- above still decide: you can only save your own look with your own pieces.

create function public.save_look_board(p_look_id uuid, p_pieces jsonb)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not exists (select 1 from public.looks where id = p_look_id) then
    raise exception 'Look not found';
  end if;
  delete from public.look_items where look_id = p_look_id;
  insert into public.look_items (look_id, item_id, x, y, width, rotation, layer)
  select p_look_id, (p ->> 'item_id')::uuid, (p ->> 'x')::real, (p ->> 'y')::real,
    (p ->> 'width')::real, coalesce((p ->> 'rotation')::real, 0), coalesce((p ->> 'layer')::integer, 0)
  from jsonb_array_elements(p_pieces) as p;
  update public.looks set updated_at = now() where id = p_look_id;
end;
$$;

revoke all on function public.save_look_board(uuid, jsonb) from public, anon;
grant execute on function public.save_look_board(uuid, jsonb) to authenticated;
