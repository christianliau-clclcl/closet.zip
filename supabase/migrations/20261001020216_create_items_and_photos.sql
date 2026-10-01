-- Milestone 5, step 1: the closet's two tables and their privacy rules.
-- See the "Item data" table in PRODUCT.md and the Data & security rules in CLAUDE.md.


-- ===========================================================================
-- items: one row per piece of clothing
-- ===========================================================================
-- Only the owner and status are required. Every descriptive field is optional.
-- Dates are stored as month + year, never full dates. A year on its own is
-- fine ("sometime in 2019"), but a month needs a year.

create table public.items (
  id uuid primary key default gen_random_uuid(),
  -- The owner. Filled in automatically with the logged-in person's ID.
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,

  name text,
  category text check (category in ('tops', 'bottoms', 'outerwear', 'shoes', 'accessories')),
  brand text,
  colour text,
  material text,
  acquired_month smallint check (acquired_month between 1 and 12),
  acquired_year smallint check (acquired_year between 1900 and 2100),
  acquired_from text,
  price numeric(10, 2) check (price >= 0), -- dollars and cents, e.g. 89.50
  notes text,

  -- Archiving changes the status; it never deletes the item.
  status text not null default 'in_closet' check (status in ('in_closet', 'archived')),
  archived_month smallint check (archived_month between 1 and 12),
  archived_year smallint check (archived_year between 1900 and 2100),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint acquired_month_needs_year check (acquired_month is null or acquired_year is not null),
  constraint archived_month_needs_year check (archived_month is null or archived_year is not null)
);

-- Makes "show me my items, newest first" fast.
create index items_user_id_created_at_idx on public.items (user_id, created_at desc);

-- Keep updated_at current whenever an item is edited.
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger items_set_updated_at
  before update on public.items
  for each row execute function public.set_updated_at();


-- ===========================================================================
-- item_photos: one row per photo, so an item can have many
-- ===========================================================================
-- The file itself lives in Supabase Storage (step 2); this row records where
-- it is, its order, and whether it's the hero shown in the grid.

create table public.item_photos (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  storage_path text not null unique, -- e.g. "<user id>/<item id>/<photo id>.webp"
  position smallint not null default 0, -- order in the overlay (Milestone 7)
  is_hero boolean not null default false,
  created_at timestamptz not null default now()
);

-- At most one hero photo per item.
create unique index item_photos_one_hero_per_item on public.item_photos (item_id) where is_hero;
create index item_photos_item_id_idx on public.item_photos (item_id);


-- ===========================================================================
-- Privacy: Row Level Security (RLS)
-- ===========================================================================
-- With RLS on, the database refuses every read and write unless a policy
-- below allows it. auth.uid() is the ID of whoever is logged in (empty for
-- logged-out visitors). Every policy says the same thing: you can only touch
-- rows marked with your own ID. Writing "(select auth.uid())" rather than
-- "auth.uid()" is Supabase's recommended form: it's checked once per query
-- instead of once per row, so it stays fast as closets grow.

alter table public.items enable row level security;
alter table public.item_photos enable row level security;

-- items ---------------------------------------------------------------------

-- You see only your own items.
create policy "Owners can view their items"
  on public.items for select to authenticated
  using ((select auth.uid()) = user_id);

-- You can only add items marked as yours (no planting items in someone else's closet).
create policy "Owners can add items"
  on public.items for insert to authenticated
  with check ((select auth.uid()) = user_id);

-- You can only edit your own items, and can't hand them to someone else.
create policy "Owners can update their items"
  on public.items for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- You can only delete your own items.
create policy "Owners can delete their items"
  on public.items for delete to authenticated
  using ((select auth.uid()) = user_id);

-- item_photos -----------------------------------------------------------------

create policy "Owners can view their photos"
  on public.item_photos for select to authenticated
  using ((select auth.uid()) = user_id);

-- A photo must be yours AND attached to an item that's yours, so nobody can
-- attach a photo to another person's item.
create policy "Owners can add photos to their items"
  on public.item_photos for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.items
      where items.id = item_id and items.user_id = (select auth.uid())
    )
  );

create policy "Owners can update their photos"
  on public.item_photos for update to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.items
      where items.id = item_id and items.user_id = (select auth.uid())
    )
  );

create policy "Owners can delete their photos"
  on public.item_photos for delete to authenticated
  using ((select auth.uid()) = user_id);


-- ===========================================================================
-- Who can reach these tables at all
-- ===========================================================================
-- Logged-out visitors ("anon") get no access, even before RLS is checked.
-- Logged-in people ("authenticated") can read and write, limited by RLS above.

revoke all on public.items, public.item_photos from anon;
grant select, insert, update, delete on public.items, public.item_photos to authenticated;
