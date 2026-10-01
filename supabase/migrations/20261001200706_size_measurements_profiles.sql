-- Milestone 8, step 1: size, garment measurements, and each person's unit choice.


-- ===========================================================================
-- On items
-- ===========================================================================
-- size_label: the size as written on the label ("M", "32 × 30", "EU 42").
-- measurements: the garment's own measurements, always in centimetres, as
-- name → number pairs, e.g. {"chest": 56, "length": 68}. Which names apply
-- depends on the category (see lib/measurements.ts). The app converts to
-- inches for people who prefer them, so precision is never lost by switching.
-- Both are optional; the existing item privacy rules already cover them.

alter table public.items
  add column size_label text,
  add column measurements jsonb not null default '{}'::jsonb
    check (jsonb_typeof(measurements) = 'object');


-- ===========================================================================
-- profiles: one row per person, for their settings
-- ===========================================================================
-- First setting: the unit for measurements (inches by default). Someone who
-- has never changed it has no row yet; the app treats that as inches.
-- Deleting an account deletes its profile with it.

create table public.profiles (
  id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  measurement_unit text not null default 'in' check (measurement_unit in ('cm', 'in')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();


-- ===========================================================================
-- Privacy: Row Level Security on profiles
-- ===========================================================================
-- Same idea as items: you can only see and change your own row. There's no
-- delete policy: a profile goes away only with its account.

alter table public.profiles enable row level security;

create policy "People can view their own profile"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

create policy "People can create their own profile"
  on public.profiles for insert to authenticated
  with check ((select auth.uid()) = id);

create policy "People can update their own profile"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

revoke all on public.profiles from anon;
grant select, insert, update on public.profiles to authenticated;
