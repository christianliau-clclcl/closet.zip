-- Milestone 15¼: the new category list (PRODUCT.md, decided 2026-10-05).
-- Five categories become fourteen, still a fixed list, head to toe:
-- tops, t_shirts, shirts, knitwear, sweatshirts, jackets, dresses, trousers,
-- skirts, shoes, sneakers, bags, sunglasses, accessories.
--
-- Existing pieces move to the closest match: bottoms → trousers,
-- outerwear → jackets; tops, shoes and accessories keep their names. Their
-- measurements stay valid (trousers use the bottom rows as bottoms did,
-- jackets the top rows as outerwear did). Pieces without one stay without.
--
-- No policy changes: the owner-only rules on items are untouched.

alter table public.items drop constraint items_category_check;

update public.items set category = 'trousers' where category = 'bottoms';
update public.items set category = 'jackets' where category = 'outerwear';

alter table public.items add constraint items_category_check
  check (category in (
    'tops', 't_shirts', 'shirts', 'knitwear', 'sweatshirts', 'jackets', 'dresses',
    'trousers', 'skirts', 'shoes', 'sneakers', 'bags', 'sunglasses', 'accessories'
  ));
