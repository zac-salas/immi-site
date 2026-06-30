-- Run this in the Supabase SQL Editor for your immi-marketing project

create table postcards (
  id          text primary key,
  image_url   text not null,        -- the postcard's front image (preset or uploaded)
  message     text not null,
  sender_name text not null,
  recipient_name text not null,
  stamp_url   text not null default '/images/Default Stamp.png',
  created_at  timestamptz not null default now(),
  expires_at  timestamptz not null
);

-- Index for fast expiry lookups (used by cleanup job)
create index idx_postcards_expires_at on postcards (expires_at);

-- Row Level Security
alter table postcards enable row level security;

-- Anyone can read a postcard by its id (needed for the public share link)
create policy "Public read access"
  on postcards for select
  using (true);

-- Anyone can insert a new postcard (no auth required, per the product design)
create policy "Public insert access"
  on postcards for insert
  with check (true);

-- No update or delete policies — postcards are immutable once created
-- Cleanup happens via the lazy-deletion pattern in the read route, or a cron job