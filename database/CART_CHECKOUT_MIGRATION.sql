-- ================================================================
-- JT COLLECTION — CART & CHECKOUT MIGRATION
-- Run in: https://supabase.com/dashboard/project/<your-id>/sql
-- Safe to run multiple times (uses IF NOT EXISTS)
-- ================================================================

-- ── 1. order_items: add price_at_purchase (required by backend controller) ──
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS price              numeric NOT NULL DEFAULT 0;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS price_at_purchase  numeric NOT NULL DEFAULT 0;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS size               text;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS color              text;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS variation_id       uuid REFERENCES product_variations(id) ON DELETE SET NULL;

-- Backfill price_at_purchase from price for existing rows
UPDATE order_items SET price_at_purchase = price WHERE price_at_purchase = 0 AND price > 0;

-- ── 2. cart: add size/color columns ─────────────────────────────────────────
ALTER TABLE cart ADD COLUMN IF NOT EXISTS selected_size  text;
ALTER TABLE cart ADD COLUMN IF NOT EXISTS selected_color text;

-- ── 3. Fix cart FK → auth.users (fixes 409/23503 insert errors) ─────────────
ALTER TABLE cart DROP CONSTRAINT IF EXISTS cart_user_id_fkey;
ALTER TABLE cart
  ADD CONSTRAINT cart_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- ── 4. Fix orders FK → auth.users ───────────────────────────────────────────
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_user_id_fkey;
ALTER TABLE orders
  ADD CONSTRAINT orders_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- ── 5. orders: ensure all required columns exist ─────────────────────────────
ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name   text    DEFAULT 'Guest';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS phone           text    DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS email           text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS address         text    DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS city            text    DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS postal_code     text    DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method  text    DEFAULT 'COD';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status  text    DEFAULT 'pending';

-- ── 6. Status constraint ──────────────────────────────────────────────────────
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check
  CHECK (status IN ('pending','confirmed','processing','shipped','delivered','cancelled','pending_payment'));

-- ── 7. RLS — cart ─────────────────────────────────────────────────────────────
ALTER TABLE cart ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own cart"   ON cart;
DROP POLICY IF EXISTS "Users can insert own cart" ON cart;
DROP POLICY IF EXISTS "Users can update own cart" ON cart;
DROP POLICY IF EXISTS "Users can delete own cart" ON cart;

CREATE POLICY "Users can view own cart"   ON cart FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cart" ON cart FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cart" ON cart FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own cart" ON cart FOR DELETE USING (auth.uid() = user_id);

-- ── 8. RLS — orders ───────────────────────────────────────────────────────────
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own orders" ON orders;
DROP POLICY IF EXISTS "Guest insert orders"   ON orders;
CREATE POLICY "Users view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- ── 9. RLS — order_items ──────────────────────────────────────────────────────
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read order items" ON order_items;
CREATE POLICY "Anyone can read order items"
  ON order_items FOR SELECT USING (true);

-- ── VERIFY ────────────────────────────────────────────────────────────────────
-- SELECT column_name FROM information_schema.columns
-- WHERE table_name = 'order_items' ORDER BY ordinal_position;
