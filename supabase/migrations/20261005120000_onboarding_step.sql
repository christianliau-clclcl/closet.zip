-- Milestone 15½: onboarding. How far through the first-run steps you are
-- (done or skipped both count). 0 means you haven't seen it yet; while it's
-- below the number of steps the app has, the closet sends you to /welcome.
-- Steps added later are shown once to people who finished the earlier ones.
--
-- No new policies: the owner-only rules on profiles already cover it.

alter table public.profiles
  add column onboarding_step smallint not null default 0,
  add constraint profiles_onboarding_step_range check (onboarding_step between 0 and 10);
