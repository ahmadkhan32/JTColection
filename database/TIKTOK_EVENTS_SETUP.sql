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
  content_type text        default 'product',
  amount      numeric     default 0,
  currency    text        default 'PKR',
  search_string text,
  user_email  text,                        -- SHA-256 hashed
  user_phone  text,                        -- SHA-256 hashed
  external_id text,                        -- SHA-256 hashed user ID
  created_at  timestamptz default now()
);

-- 2. Add columns if table already exists (idempotent upgrade)
alter table tiktok_events add column if not exists content_type  text default 'product';
alter table tiktok_events add column if not exists user_email    text;
alter table tiktok_events add column if not exists user_phone    text;
alter table tiktok_events add column if not exists external_id   text;

-- 3. Enable Row Level Security
alter table tiktok_events enable row level security;

-- 4. Allow anonymous inserts (browser pixel fires before auth)
drop policy if exists "Allow anon insert" on tiktok_events;
create policy "Allow anon insert"
  on tiktok_events
  for insert
  to anon
  with check (true);

-- 5. Restrict reads to authenticated users only (admins can query in dashboard)
drop policy if exists "Allow authenticated select" on tiktok_events;
create policy "Allow authenticated select"
  on tiktok_events
  for select
  to authenticated
  using (true);

-- 6. Index for dashboard queries
create index if not exists idx_tiktok_events_event_name  on tiktok_events (event_name);
create index if not exists idx_tiktok_events_created_at  on tiktok_events (created_at desc);
