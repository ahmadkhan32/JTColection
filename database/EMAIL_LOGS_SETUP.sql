-- ============================================================
-- JT Collections – Email Logs System
-- Run ONCE in Supabase SQL Editor
-- Safe to re-run: uses IF NOT EXISTS
-- ============================================================

-- ── 1. email_logs table ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.email_logs (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID        REFERENCES public.orders(id) ON DELETE SET NULL,
  user_id     UUID,
  email       TEXT        NOT NULL,
  type        TEXT        NOT NULL DEFAULT 'order_confirmation',
  -- 'order_confirmation' | 'status_update' | 'custom'
  subject     TEXT,
  status      TEXT        NOT NULL DEFAULT 'pending',
  -- 'pending' | 'sent' | 'failed'
  error_msg   TEXT,
  attempts    INTEGER     NOT NULL DEFAULT 1,
  sent_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 2. Indexes ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_email_logs_order_id
  ON public.email_logs (order_id);

CREATE INDEX IF NOT EXISTS idx_email_logs_status
  ON public.email_logs (status);

CREATE INDEX IF NOT EXISTS idx_email_logs_created_at
  ON public.email_logs (created_at DESC);

-- ── 3. RLS ─────────────────────────────────────────────────
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Admin (service-role) always bypasses RLS.
-- Deny all access to anon / authenticated users via API to protect PII.
-- If you want admins to query from the dashboard, add a policy:
-- CREATE POLICY "Admin reads email_logs"
--   ON public.email_logs FOR SELECT
--   USING (auth.jwt() ->> 'role' = 'admin');

-- ── 4. Verify ──────────────────────────────────────────────
-- SELECT * FROM public.email_logs ORDER BY created_at DESC LIMIT 10;
