-- ─────────────────────────────────────────────────────────────────────────────
-- TikTok Events Log Table
-- Run this in your Supabase SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Create table
create table if not exists tiktok_events (
  id          bigint generated always as identity primary key,
  event_name  text        not null,
  event_id    text        unique,          -- deduplication key
  product_id  text,
  product_name text,
  amount      numeric     default 0,
  currency    text        default 'PKR',
  search_string text,
  created_at  timestamptz default now()
);

-- 2. Enable Row Level Security
alter table tiktok_events enable row level security;

-- 3. Allow anonymous inserts (browser pixel fires before auth)
create policy "Allow anon insert"
  on tiktok_events
  for insert
  to anon
  with check (true);

-- 4. Restrict reads to authenticated users only (admins can query in dashboard)
create policy "Allow authenticated select"
  on tiktok_events
  for select
  to authenticated
  using (true);

-- 5. Index for dashboard queries
create index if not exists idx_tiktok_events_event_name  on tiktok_events (event_name);
create index if not exists idx_tiktok_events_created_at  on tiktok_events (created_at desc);
