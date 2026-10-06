-- Milestone 17e: looks on public pages, through the public door (see
-- 20261005180000_public_door.sql and 20261005200000_sell_from_your_closet.sql).
--
-- Same rules as the rest of the door: nothing unless the profile is PUBLIC
-- (and nothing on a FOR SALE ONLY page); only looks that aren't hidden; and
-- on each board only the pieces a visitor can already see (not hidden), so
-- a look never reveals a hidden piece. Read-only. Photos need no new rule:
-- they're photos of visible pieces, which is_public_photo already allows.

create function public.public_looks(p_username text)
returns table (
  id uuid,
  name text,
  note text,
  "position" integer,
  created_at timestamptz,
  pieces jsonb
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
    l.id, l.name, nullif(trim(l.note), ''), l.position, l.created_at,
    coalesce(
      (select jsonb_agg(
         jsonb_build_object(
           'item_id', li.item_id, 'x', li.x, 'y', li.y, 'width', li.width,
           'rotation', li.rotation, 'layer', li.layer
         ) order by li.layer)
       from public.look_items li
       join public.items i on i.id = li.item_id
       where li.look_id = l.id and not i.is_hidden),
      '[]'::jsonb
    )
  from public.looks l, owner
  where l.user_id = owner.id and not l.is_hidden;
$$;

-- Anyone may call it, logged in or not.
revoke all on function public.public_looks(text) from public;
grant execute on function public.public_looks(text) to anon, authenticated;
