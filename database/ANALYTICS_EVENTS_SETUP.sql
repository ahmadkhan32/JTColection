-- ─────────────────────────────────────────────────────────────────────────────
-- analytics_events table
-- General-purpose event log for all tracking events (TikTok, Meta, custom).
-- Run this in Supabase SQL Editor → New Query → Run
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists analytics_events (
  id          bigint generated always as identity primary key,
  platform    text        not null default 'tiktok', -- 'tiktok' | 'meta' | 'custom'
  event_name  text        not null,
  event_id    text,                                  -- deduplication ID
  user_id     uuid        references auth.users(id) on delete set null,
  session_id  text,                                  -- anonymous session identifier
  value       numeric(12, 2),
  currency    text        default 'PKR',
  content_id  text,
  content_name text,
  content_type text       default 'product',
  contents    jsonb,                                 -- array of cart/order items
  num_items   integer,
  search_string text,
  page_url    text,
  user_ip     text,
  user_agent  text,
  extra       jsonb,                                 -- any additional payload
  created_at  timestamptz not null default now()
);

-- Indexes for common query patterns
create index if not exists analytics_events_platform_idx    on analytics_events (platform);
create index if not exists analytics_events_event_name_idx  on analytics_events (event_name);
create index if not exists analytics_events_user_id_idx     on analytics_events (user_id);
create index if not exists analytics_events_created_at_idx  on analytics_events (created_at desc);

-- Row Level Security: service role can write; authenticated users can read own rows
alter table analytics_events enable row level security;

create policy "Service role full access"
  on analytics_events
  for all
  using (auth.role() = 'service_role');

create policy "Users can view own events"
  on analytics_events
  for select
  using (auth.uid() = user_id);
