-- Milestone 5, step 2: private storage for item photos.
-- Files are stored as "<user id>/<item id>/<photo id>.webp" (or .png).
-- The item_photos table (previous migration) records each file's path.


-- ===========================================================================
-- The bucket
-- ===========================================================================
-- Private: files can't be opened by URL. The app asks Supabase for a
-- short-lived signed link for each photo it shows.
-- Only WebP and PNG are accepted (the browser resizes to one of these before
-- uploading, keeping transparency), up to 5MB per file.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('item-photos', 'item-photos', false, 5242880, array['image/webp', 'image/png']);


-- ===========================================================================
-- Privacy: Row Level Security on the files
-- ===========================================================================
-- Supabase Storage already has RLS switched on for storage.objects (one row
-- per file). These policies open up exactly one thing: your own folder in
-- this bucket. storage.foldername(name) splits a path into its folders, so
-- (storage.foldername(name))[1] is the first folder: the owner's user ID.
-- Logged-out visitors get no policy, so they can't do anything.

create policy "Owners can view their photo files"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'item-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Owners can upload photo files to their folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'item-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- Replacing a file, and making sure it can't be moved into someone else's folder.
create policy "Owners can replace their photo files"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'item-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'item-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Owners can delete their photo files"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'item-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
