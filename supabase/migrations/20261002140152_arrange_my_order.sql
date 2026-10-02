-- Milestone 12g: save "My order" in one go, for the whole closet (ALL) or
-- for one folder. Like reorder_item_photos: one function, one transaction,
-- so an order is either saved completely or not at all.
--
-- "security invoker" means they run as the logged-in person, so Row Level
-- Security still applies: someone else's pieces or folder links are
-- invisible here and simply don't change.

-- The closet's order: the listed pieces get places 0, 1, 2… in list order.
-- Pieces not listed (e.g. archived ones when arranging ALL) keep theirs.
create function public.arrange_items(p_item_ids uuid[])
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  update public.items as i
  set sort_position = o.ord - 1
  from unnest(p_item_ids) with ordinality as o(id, ord)
  where i.id = o.id;
end;
$$;

-- One folder's order: its pieces get places 0, 1, 2… in list order.
create function public.arrange_folder(p_folder_id uuid, p_item_ids uuid[])
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  update public.folder_items as fi
  set position = o.ord - 1
  from unnest(p_item_ids) with ordinality as o(id, ord)
  where fi.folder_id = p_folder_id and fi.item_id = o.id;
end;
$$;

-- Only logged-in people can call them (and RLS limits them to their rows).
revoke all on function public.arrange_items(uuid[]) from public, anon;
grant execute on function public.arrange_items(uuid[]) to authenticated;
revoke all on function public.arrange_folder(uuid, uuid[]) from public, anon;
grant execute on function public.arrange_folder(uuid, uuid[]) to authenticated;
