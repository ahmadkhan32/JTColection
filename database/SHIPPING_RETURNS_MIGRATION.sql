-- ============================================================
-- SHIPPING & RETURNS MIGRATION
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. SHIPPING TABLE
-- Tracks physical shipment details per order
CREATE TABLE IF NOT EXISTS shipping (
  id              uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id        uuid        REFERENCES orders(id) ON DELETE SET NULL,
  user_id         uuid,
  address         text        NOT NULL,
  city            text        NOT NULL,
  country         text        NOT NULL DEFAULT 'Pakistan',
  postal_code     text,
  shipping_method text        NOT NULL DEFAULT 'standard',
  status          text        NOT NULL DEFAULT 'processing'
                              CHECK (status IN ('processing','shipped','out_for_delivery','delivered','failed')),
  tracking_number text,
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- 2. RETURNS TABLE
-- Tracks return/refund requests per order
CREATE TABLE IF NOT EXISTS returns (
  id            uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id      uuid        REFERENCES orders(id) ON DELETE SET NULL,
  user_id       uuid,
  reason        text        NOT NULL,
  status        text        NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending','approved','rejected','completed')),
  refund_status text        NOT NULL DEFAULT 'not_processed'
                            CHECK (refund_status IN ('not_processed','processing','refunded','failed')),
  admin_notes   text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- 3. AUTO-UPDATE updated_at TRIGGER
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS set_shipping_updated_at ON shipping;
CREATE TRIGGER set_shipping_updated_at
  BEFORE UPDATE ON shipping
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_returns_updated_at ON returns;
CREATE TRIGGER set_returns_updated_at
  BEFORE UPDATE ON returns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. ROW LEVEL SECURITY
ALTER TABLE shipping ENABLE ROW LEVEL SECURITY;
ALTER TABLE returns  ENABLE ROW LEVEL SECURITY;

-- Allow service role (admin backend) full access
CREATE POLICY "service_role_shipping_all"  ON shipping USING (true) WITH CHECK (true);
CREATE POLICY "service_role_returns_all"   ON returns  USING (true) WITH CHECK (true);

-- 5. INDEXES for fast lookups
CREATE INDEX IF NOT EXISTS idx_shipping_order_id  ON shipping (order_id);
CREATE INDEX IF NOT EXISTS idx_shipping_user_id   ON shipping (user_id);
CREATE INDEX IF NOT EXISTS idx_returns_order_id   ON returns  (order_id);
CREATE INDEX IF NOT EXISTS idx_returns_user_id    ON returns  (user_id);

-- 6. VERIFICATION
SELECT 'shipping table created' AS result WHERE EXISTS (
  SELECT FROM information_schema.tables WHERE table_name = 'shipping'
);
SELECT 'returns table created' AS result WHERE EXISTS (
  SELECT FROM information_schema.tables WHERE table_name = 'returns'
);
