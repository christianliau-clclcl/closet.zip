-- Milestone 15c: the public door (PRODUCT.md "Public profiles").
--
-- The first deliberate exception to "every closet is private": a closet
-- whose owner turned PUBLIC on can be read by anyone with its address.
-- The tables keep their owner-only Row Level Security, untouched. Visitors
-- (logged out or in; the owner too, to preview) instead call the three
-- functions below. They run with the database owner's rights ("security
-- definer") but only ever return a narrow slice:
--   - nothing at all unless the profile is PUBLIC; a private profile looks
--     exactly like a username that doesn't exist
--   - pieces and folders that aren't hidden; a hidden folder hides the
--     folders inside it too (decided 2026-10-05)
--   - catalogue fields only: never price, where from, notes, how or when a
--     piece left, the owner's email or account ID
-- They only read; nothing here lets a visitor change anything.
--
-- Photos: a storage rule lets anyone open a photo file only if it belongs
-- to a visible piece in a public closet, or is a visible folder's uploaded
-- cover. Turning PUBLIC off or hiding a piece closes it straight away
-- (photo links already handed out expire within the hour).


-- ===========================================================================
-- Helpers (not callable from the app)
-- ===========================================================================

-- The account behind a PUBLIC username, or null.
create function public.public_owner(p_username text)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select id from public.profiles
  where username = lower(p_username) and is_public;
$$;

-- An owner's visible folders: not hidden, and every folder above them not
-- hidden either. Walks down from the top-level folders, stopping at hidden ones.
create function public.visible_folder_ids(p_owner uuid)
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  with recursive visible as (
    select f.id from public.folders f
    where f.user_id = p_owner and f.parent_id is null and not f.is_hidden
    union all
    select f.id from public.folders f
    join visible v on f.parent_id = v.id
    where f.user_id = p_owner and not f.is_hidden
  )
  select id from visible;
$$;

revoke all on function public.public_owner(text) from public, anon, authenticated;
revoke all on function public.visible_folder_ids(uuid) from public, anon, authenticated;


-- ===========================================================================
-- The door: three read-only functions
-- ===========================================================================

-- The profile: its username and closet name (from the account's details).
create function public.public_profile(p_username text)
returns table (username text, closet_name text)
language sql
stable
security definer
set search_path = ''
as $$
  select p.username, nullif(trim(u.raw_user_meta_data ->> 'closet_name'), '')
  from public.profiles p
  join auth.users u on u.id = p.id
  where p.id = public.public_owner(p_username);
$$;

-- The visible pieces, with their photos (hero first, then in order).
-- Archived pieces only say that they're archived.
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
  photos jsonb
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
    )
  from public.items i
  where i.user_id = public.public_owner(p_username) and not i.is_hidden
  order by i.created_at desc;
$$;

-- The visible folders, each with its visible pieces (in the folder's
-- order). A cover piece that's hidden isn't shared: the folder shows the box.
create function public.public_folders(p_username text)
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
  with owner as (select public.public_owner(p_username) as id)
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

-- Anyone may call the door, logged in or not.
revoke all on function public.public_profile(text) from public;
revoke all on function public.public_items(text) from public;
revoke all on function public.public_folders(text) from public;
grant execute on function public.public_profile(text) to anon, authenticated;
grant execute on function public.public_items(text) to anon, authenticated;
grant execute on function public.public_folders(text) to anon, authenticated;


-- ===========================================================================
-- Photos: the storage rule
-- ===========================================================================

-- Is this file a photo (full size or thumbnail) of a visible piece in a
-- public closet, or the uploaded cover of a visible folder? Only answers
-- yes or no for one path.
create function public.is_public_photo(p_path text)
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
  ) or exists (
    select 1
    from public.folders f
    join public.profiles p on p.id = f.user_id
    where f.cover_path = p_path
      and p.is_public
      and f.id in (select public.visible_folder_ids(f.user_id))
  );
$$;

revoke all on function public.is_public_photo(text) from public;
grant execute on function public.is_public_photo(text) to anon, authenticated;

-- Viewing only (making signed links). Uploading, replacing and deleting
-- stay owner-only, from the earlier policies.
create policy "Anyone can view public pieces' photo files"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'item-photos' and public.is_public_photo(name));
