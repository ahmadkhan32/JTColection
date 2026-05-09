-- ─────────────────────────────────────────────────────────────────────────────
-- Meta Events Table
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable UUID generation if not already enabled
create extension if not exists "uuid-ossp";

-- Meta pixel / CAPI event log
create table if not exists meta_events (
  id           uuid        default uuid_generate_v4() primary key,
  event_name   text        not null,
  event_id     text        not null,       -- deduplication key (same ID sent to both pixel & CAPI)
  value        numeric,
  currency     text        default 'PKR',
  content_name text,
  content_ids  text[],
  num_items    integer,
  user_ip      text,                       -- for Meta match quality (client_ip_address)
  user_agent   text,                       -- for Meta match quality (client_user_agent)
  created_at   timestamptz default now()
);

-- Index for quick lookups by event name or dedup ID
create index if not exists idx_meta_events_event_name on meta_events (event_name);
create index if not exists idx_meta_events_event_id   on meta_events (event_id);

-- Row-Level Security — only the service-role key (backend) may write/read
alter table meta_events enable row level security;

-- Allow backend (service-role) full access; deny anon/public reads
drop policy if exists "service_role_all" on meta_events;

create policy "service_role_all" on meta_events
  for all
  using     (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
