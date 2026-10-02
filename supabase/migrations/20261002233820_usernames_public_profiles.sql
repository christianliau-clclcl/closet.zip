-- Milestone 15a: usernames and the PUBLIC switch (PRODUCT.md "Public
-- profiles"). Nothing is visible to anyone else yet: this only records the
-- choice. What a public closet shows, and to whom, comes in 15c.

alter table public.profiles
  -- Your public address: /@username. Stored in lowercase, so it isn't
  -- case-sensitive ("Christian" and "christian" are one name).
  add column username text,
  -- Off by default: closets are private until their owner says otherwise.
  add column is_public boolean not null default false;

-- 3–20 lowercase letters, numbers, . and _.
alter table public.profiles add constraint profiles_username_format
  check (username ~ '^[a-z0-9._]{3,20}$');

-- Words that would clash with the app's own pages or look official.
alter table public.profiles add constraint profiles_username_not_reserved
  check (username not in (
    'admin', 'administrator', 'add', 'api', 'auth', 'login', 'logout', 'signup',
    'settings', 'u', 'items', 'help', 'support', 'about', 'closet', 'closetzip',
    'forgot-password', 'reset-password', 'root', 'me'
  ));

-- One person per username.
create unique index profiles_username_key on public.profiles (username);

-- A closet can only be public once it has an address.
alter table public.profiles add constraint profiles_public_needs_username
  check (not is_public or username is not null);

-- Is a username free? Other people's profiles are private (Row Level
-- Security), so this answers only that one yes/no question, running with the
-- database owner's rights ("security definer") to look across profiles.
-- Your own current username counts as free for you.
create function public.username_available(p_username text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select not exists (
    select 1 from public.profiles
    where username = lower(p_username) and id <> (select auth.uid())
  );
$$;

-- Only logged-in people can ask.
revoke all on function public.username_available(text) from public, anon;
grant execute on function public.username_available(text) to authenticated;
