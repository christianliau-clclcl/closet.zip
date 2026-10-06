-- Milestone 16a: sell from your public closet (PRODUCT.md, planned 2026-10-05).
-- Pieces can be listed for sale; listings appear in a FOR SALE tab on your
-- public page. Buyers get in touch through a contact line you write; nothing
-- about buyers is stored, and no money goes through the app.


-- ===========================================================================
-- Listings, on items
-- ===========================================================================
-- asking_price is what you're asking now. It's separate from price (what you
-- paid), which stays private. The app also requires every measurement row
-- for the piece's category before listing (lib/categories.ts); the database
-- checks the rest.

alter table public.items
  add column for_sale boolean not null default false,
  add column asking_price numeric check (asking_price >= 0),
  add column condition text check (condition in ('new_with_tags', 'like_new', 'good', 'worn')),
  add column sale_note text check (length(sale_note) <= 200);

alter table public.items add constraint items_listing_complete
  check (not for_sale or (asking_price is not null and condition is not null and nullif(trim(size_label), '') is not null));

-- A listed piece is always shown, and still in your closet.
alter table public.items add constraint items_listing_shown
  check (not for_sale or (not is_hidden and status = 'in_closet'));


-- ===========================================================================
-- Your public page: FOR SALE ONLY, and the contact line
-- ===========================================================================
-- PUBLIC's three settings: OFF (is_public false), ON (is_public), and FOR
-- SALE ONLY (is_public and for_sale_only): the page shows only your
-- listings, none of the rest of your closet.

alter table public.profiles
  add column for_sale_only boolean not null default false,
  add column sale_contact text check (length(sale_contact) <= 200);


-- ===========================================================================
-- The public door, updated (see 20261005180000_public_door.sql)
-- ===========================================================================
-- Same rules as before, plus: listings bring their asking price, condition
-- and note (nothing for pieces not for sale), and a FOR SALE ONLY page
-- returns only listed pieces, no folders, and only their photos. Functions
-- whose results change shape are dropped and made again.

drop function public.public_profile(text);
create function public.public_profile(p_username text)
returns table (username text, closet_name text, for_sale_only boolean, sale_contact text)
language sql
stable
security definer
set search_path = ''
as $$
  select p.username, nullif(trim(u.raw_user_meta_data ->> 'closet_name'), ''),
    p.for_sale_only, nullif(trim(p.sale_contact), '')
  from public.profiles p
  join auth.users u on u.id = p.id
  where p.id = public.public_owner(p_username);
$$;

drop function public.public_items(text);
create function public.public_items(p_username text)
returns table (
  id uuid,
  name text,
  category text,
  brand text,
  colour text,
  colour_hex text,
  material text,
  size_label text,
  measurements jsonb,
  acquired_month smallint,
  acquired_year smallint,
  is_archived boolean,
  sort_position integer,
  created_at timestamptz,
  photos jsonb,
  for_sale boolean,
  asking_price numeric,
  condition text,
  sale_note text
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    i.id, i.name, i.category, i.brand, i.colour, i.colour_hex, i.material,
    i.size_label, i.measurements, i.acquired_month, i.acquired_year,
    i.status = 'archived', i.sort_position, i.created_at,
    coalesce(
      (select jsonb_agg(
         jsonb_build_object(
           'id', ph.id, 'storage_path', ph.storage_path, 'thumb_path', ph.thumb_path,
           'is_hero', ph.is_hero, 'position', ph.position
         ) order by ph.is_hero desc, ph.position)
       from public.item_photos ph where ph.item_id = i.id),
      '[]'::jsonb
    ),
    i.for_sale,
    case when i.for_sale then i.asking_price end,
    case when i.for_sale then i.condition end,
    case when i.for_sale then nullif(trim(i.sale_note), '') end
  from public.items i
  join public.profiles p on p.id = i.user_id
  where i.user_id = public.public_owner(p_username)
    and not i.is_hidden
    and (i.for_sale or not p.for_sale_only)
  order by i.created_at desc;
$$;

create or replace function public.public_folders(p_username text)
returns table (
  id uuid,
  name text,
  parent_id uuid,
  cover_item_id uuid,
  cover_path text,
  "position" integer,
  created_at timestamptz,
  items jsonb
)
language sql
stable
security definer
set search_path = ''
as $$
  with owner as (
    select p.id from public.profiles p
    where p.id = public.public_owner(p_username) and not p.for_sale_only
  )
  select
    f.id, f.name, f.parent_id,
    case when exists (
      select 1 from public.items i where i.id = f.cover_item_id and not i.is_hidden
    ) then f.cover_item_id end,
    f.cover_path, f.position, f.created_at,
    coalesce(
      (select jsonb_agg(
         jsonb_build_object('item_id', fi.item_id, 'position', fi.position, 'created_at', fi.created_at))
       from public.folder_items fi
       join public.items i on i.id = fi.item_id
       where fi.folder_id = f.id and not i.is_hidden),
      '[]'::jsonb
    )
  from public.folders f, owner
  where f.user_id = owner.id
    and f.id in (select public.visible_folder_ids(owner.id));
$$;

create or replace function public.is_public_photo(p_path text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.item_photos ph
    join public.items i on i.id = ph.item_id
    join public.profiles p on p.id = i.user_id
    where (ph.storage_path = p_path or ph.thumb_path = p_path)
      and p.is_public and not i.is_hidden
      and (i.for_sale or not p.for_sale_only)
  ) or exists (
    select 1
    from public.folders f
    join public.profiles p on p.id = f.user_id
    where f.cover_path = p_path
      and p.is_public and not p.for_sale_only
      and f.id in (select public.visible_folder_ids(f.user_id))
  );
$$;

-- Anyone may call the door, logged in or not (the dropped functions lost
-- their permissions, so they're given again).
revoke all on function public.public_profile(text) from public;
revoke all on function public.public_items(text) from public;
grant execute on function public.public_profile(text) to anon, authenticated;
grant execute on function public.public_items(text) to anon, authenticated;
