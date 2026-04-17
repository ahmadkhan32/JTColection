-- ================================================================
-- ORDER MANAGEMENT SYSTEM - STATUS MIGRATION
-- Run once in Supabase SQL Editor → https://supabase.com/dashboard
-- Project: xmssdsjhinitkykdpatb
-- ================================================================

-- 1. Add status constraint (forward-only flow enforcement at DB level)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'orders_status_check' AND conrelid = 'orders'::regclass
  ) THEN
    ALTER TABLE orders ADD CONSTRAINT orders_status_check
      CHECK (status IN ('pending','confirmed','processing','shipped','delivered','cancelled'));
  END IF;
END $$;

-- 2. Add lifecycle timestamp columns
ALTER TABLE orders ADD COLUMN IF NOT EXISTS confirmed_at  timestamptz;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS processing_at timestamptz;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipped_at    timestamptz;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivered_at  timestamptz;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancelled_at  timestamptz;

-- 3. Admin full-access RLS policies (service_role bypasses RLS, but explicit for anon admin)
DROP POLICY IF EXISTS "Admin full access orders" ON orders;
CREATE POLICY "Admin full access orders" ON orders FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin full access order_items" ON order_items;
CREATE POLICY "Admin full access order_items" ON order_items FOR ALL USING (true) WITH CHECK (true);

-- 4. Enable realtime on orders table (run in Supabase dashboard > Database > Replication)
-- ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- 5. Verify
SELECT 
  COUNT(*) as total_orders,
  COUNT(*) FILTER (WHERE status = 'pending')    as pending,
  COUNT(*) FILTER (WHERE status = 'confirmed')  as confirmed,
  COUNT(*) FILTER (WHERE status = 'processing') as processing,
  COUNT(*) FILTER (WHERE status = 'shipped')    as shipped,
  COUNT(*) FILTER (WHERE status = 'delivered')  as delivered,
  COUNT(*) FILTER (WHERE status = 'cancelled')  as cancelled,
  SUM(total_amount) FILTER (WHERE status = 'delivered') as total_revenue
FROM orders;
