-- Milestone 7, step 3: save a new photo order in one go.
--
-- The first photo in the list becomes the hero; the rest follow in order.
-- Doing it in one function means one transaction: either every photo's
-- position and hero flag change, or none do, so a piece can never be left
-- with no hero or two halfway through.
--
-- "security invoker" means it runs as the logged-in person, so the existing
-- Row Level Security rules still apply: someone else's photos are invisible,
-- the check below fails, and nothing changes.

create function public.reorder_item_photos(p_item_id uuid, p_photo_ids uuid[])
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  existing int;
begin
  select count(*) into existing from public.item_photos where item_id = p_item_id;

  -- The list must contain exactly this piece's photos, each once.
  if existing = 0
     or cardinality(p_photo_ids) <> existing
     or (select count(distinct id) from unnest(p_photo_ids) as id) <> existing
     or exists (
       select 1 from unnest(p_photo_ids) as id
       where id not in (select ip.id from public.item_photos ip where ip.item_id = p_item_id)
     )
  then
    raise exception 'The photo list doesn''t match this piece''s photos';
  end if;

  -- Clear the old hero first (there can only ever be one), then apply the order.
  update public.item_photos set is_hero = false where item_id = p_item_id and is_hero;

  update public.item_photos as p
  set position = o.ord - 1,
      is_hero = (o.ord = 1)
  from unnest(p_photo_ids) with ordinality as o(id, ord)
  where p.id = o.id and p.item_id = p_item_id;
end;
$$;

-- Only logged-in people can call it (and RLS limits it to their own photos).
revoke all on function public.reorder_item_photos(uuid, uuid[]) from public, anon;
grant execute on function public.reorder_item_photos(uuid, uuid[]) to authenticated;
