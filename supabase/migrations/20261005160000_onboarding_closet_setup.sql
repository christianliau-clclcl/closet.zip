-- Milestone 15¼b: onboarding steps 2–3, saved on your profile.
--   closet_categories: the categories you ticked in "What's in your closet?"
--     (null until you answer). Add shows these first.
--   usual_sizes: the size you usually buy, by kind of size:
--     {"letter": "M", "waist": "31", "shoe": "9.5"}; any can be missing.
--     Add fills it in until your own pieces show a usual size per category.
--
-- No new policies: the owner-only rules on profiles already cover these.

alter table public.profiles
  add column closet_categories text[],
  add column usual_sizes jsonb not null default '{}'::jsonb;

-- Only real categories (the list in lib/categories.ts and items_category_check).
alter table public.profiles add constraint profiles_closet_categories_known
  check (closet_categories <@ array[
    'tops', 't_shirts', 'shirts', 'knitwear', 'sweatshirts', 'jackets', 'dresses',
    'trousers', 'skirts', 'shoes', 'sneakers', 'bags', 'sunglasses', 'accessories'
  ]::text[]);

-- An object with only these keys, each a short piece of text.
alter table public.profiles add constraint profiles_usual_sizes_shape
  check (
    jsonb_typeof(usual_sizes) = 'object'
    and not (usual_sizes - array['letter', 'waist', 'shoe'] <> '{}'::jsonb)
    and coalesce(length(usual_sizes ->> 'letter'), 0) <= 20
    and coalesce(length(usual_sizes ->> 'waist'), 0) <= 20
    and coalesce(length(usual_sizes ->> 'shoe'), 0) <= 20
  );
