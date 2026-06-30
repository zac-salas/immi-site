-- Run in Supabase SQL Editor after creating the 'postcard-images' bucket
-- (Dashboard → Storage → New bucket → name: postcard-images → Public: ON)

-- Allow anyone to upload (no auth, matches the rest of the product)
create policy "Public upload access"
  on storage.objects for insert
  with check (bucket_id = 'postcard-images');

-- Allow anyone to read uploaded images (needed to display them on cards)
create policy "Public read access for uploads"
  on storage.objects for select
  using (bucket_id = 'postcard-images');