-- ================================================================
-- JT COLLECTION — CURRENCY, INVOICE & ORDER LIFECYCLE MIGRATION
-- Run in: https://supabase.com/dashboard/project/<your-id>/sql
-- Safe to run multiple times
-- ================================================================

-- ── 1. Add currency column to orders ─────────────────────────────────────────
ALTER TABLE orders ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'PKR';

-- ── 2. Ensure price + price_at_purchase exist on order_items ─────────────────
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS price              NUMERIC NOT NULL DEFAULT 0;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS price_at_purchase  NUMERIC NOT NULL DEFAULT 0;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS size               TEXT;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS color              TEXT;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS variation_id       UUID REFERENCES product_variations(id) ON DELETE SET NULL;

-- Backfill price_at_purchase from price for existing rows
UPDATE order_items SET price_at_purchase = price WHERE price_at_purchase = 0 AND price > 0;

-- ── 3. Ensure orders has all required columns ─────────────────────────────────
ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name   TEXT    DEFAULT 'Guest';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS phone           TEXT    DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS email           TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS address         TEXT    DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS city            TEXT    DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS postal_code     TEXT    DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method  TEXT    DEFAULT 'COD';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status  TEXT    DEFAULT 'pending';

-- ── 4. Orders status constraint (includes cancelled) ─────────────────────────
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check
  CHECK (status IN ('pending','confirmed','processing','shipped','delivered','cancelled','pending_payment'));

-- ── 5. currency_rates table (for future admin-configurable rates) ─────────────
CREATE TABLE IF NOT EXISTS currency_rates (
  id       SERIAL PRIMARY KEY,
  currency TEXT   NOT NULL UNIQUE,
  rate     NUMERIC NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default rates (PKR base = 1)
INSERT INTO currency_rates (currency, rate) VALUES
  ('PKR', 1),
  ('USD', 0.0036),
  ('AED', 0.013)
ON CONFLICT (currency) DO NOTHING;

-- ── 6. Fix cart FK → auth.users ───────────────────────────────────────────────
ALTER TABLE cart DROP CONSTRAINT IF EXISTS cart_user_id_fkey;
ALTER TABLE cart
  ADD CONSTRAINT cart_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- ── 7. Fix orders FK → auth.users ────────────────────────────────────────────
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_user_id_fkey;
ALTER TABLE orders
  ADD CONSTRAINT orders_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- ── 8. RLS — cart ─────────────────────────────────────────────────────────────
ALTER TABLE cart ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own cart"   ON cart;
DROP POLICY IF EXISTS "Users can insert own cart" ON cart;
DROP POLICY IF EXISTS "Users can update own cart" ON cart;
DROP POLICY IF EXISTS "Users can delete own cart" ON cart;

CREATE POLICY "Users can view own cart"   ON cart FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cart" ON cart FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cart" ON cart FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own cart" ON cart FOR DELETE USING (auth.uid() = user_id);

-- ── 9. RLS — orders ───────────────────────────────────────────────────────────
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own orders" ON orders;
CREATE POLICY "Users view own orders"
  ON orders FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

-- ── 10. RLS — order_items ─────────────────────────────────────────────────────
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read order items" ON order_items;
CREATE POLICY "Anyone can read order items"
  ON order_items FOR SELECT USING (true);

-- ── 11. RLS — currency_rates (public read) ────────────────────────────────────
ALTER TABLE currency_rates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read currency rates" ON currency_rates;
CREATE POLICY "Public read currency rates"
  ON currency_rates FOR SELECT USING (true);

-- ── VERIFY ────────────────────────────────────────────────────────────────────
-- SELECT * FROM currency_rates;
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'orders' ORDER BY ordinal_position;
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'order_items' ORDER BY ordinal_position;
