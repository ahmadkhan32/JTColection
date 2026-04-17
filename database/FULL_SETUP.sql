-- ================================================================
-- JT COLLECTION — COMPLETE ONE-TIME SETUP SQL
-- Run this entire file in: https://supabase.com/dashboard/project/xmssdsjhinitkykdpatb/sql
-- Safe to run multiple times (uses IF NOT EXISTS / IF EXISTS)
-- ================================================================

-- ── STEP 1: Ensure orders table has all required columns ─────────────────

ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name text DEFAULT 'Guest';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS phone       text DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS email       text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS address     text DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS city        text DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS postal_code text DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method text DEFAULT 'COD';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending';

-- ── STEP 2: Ensure order_items has all required columns ──────────────────

-- Core columns that may be missing on older installs
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS price numeric NOT NULL DEFAULT 0;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS size  text;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS color text;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS variation_id uuid
  REFERENCES product_variations(id) ON DELETE SET NULL;

-- ── STEP 3: Status constraint ─────────────────────────────────────────────

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check
  CHECK (status IN ('pending','confirmed','processing','shipped','delivered','cancelled','pending_payment'));

-- ── STEP 4: Fix cart FK → auth.users (fixes 409/23503 errors) ────────────

ALTER TABLE cart DROP CONSTRAINT IF EXISTS cart_user_id_fkey;
ALTER TABLE cart
  ADD CONSTRAINT cart_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- ── STEP 5: Fix orders FK → auth.users ───────────────────────────────────

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_user_id_fkey;
ALTER TABLE orders
  ADD CONSTRAINT orders_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- ── STEP 6: Profiles table (used by auth context for role/name) ───────────

CREATE TABLE IF NOT EXISTS profiles (
  id   uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text,
  username text,
  email text,
  role text DEFAULT 'user',
  created_at timestamptz DEFAULT now()
);

-- Add email column to existing installs
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email text;

-- ── STEP 7: RLS — orders (allow backend service role to bypass) ───────────

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for service role" ON orders;
DROP POLICY IF EXISTS "Users view own orders"      ON orders;
DROP POLICY IF EXISTS "Guest insert orders"        ON orders;

-- Backend uses service_role key → bypasses RLS entirely (no policy needed)
-- Frontend direct reads (success page fallback):
CREATE POLICY "Users view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- ── STEP 8: RLS — order_items ─────────────────────────────────────────────

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read order items" ON order_items;
CREATE POLICY "Anyone can read order items"
  ON order_items FOR SELECT USING (true);

-- ── STEP 9: RLS — cart ────────────────────────────────────────────────────

ALTER TABLE cart ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own cart"   ON cart;
DROP POLICY IF EXISTS "Users can insert own cart" ON cart;
DROP POLICY IF EXISTS "Users can update own cart" ON cart;
DROP POLICY IF EXISTS "Users can delete own cart" ON cart;

CREATE POLICY "Users can view own cart"   ON cart FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cart" ON cart FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cart" ON cart FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own cart" ON cart FOR DELETE USING (auth.uid() = user_id);

-- ── STEP 10: RLS — profiles ───────────────────────────────────────────────

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own profile"   ON profiles;
DROP POLICY IF EXISTS "Users update own profile" ON profiles;
DROP POLICY IF EXISTS "Users insert own profile" ON profiles;

CREATE POLICY "Users view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ── STEP 11: RLS — products (public read) ────────────────────────────────

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read products" ON products;
CREATE POLICY "Public read products"
  ON products FOR SELECT USING (true);

-- ── STEP 12: RLS — categories & subcategories (public read) ──────────────

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read categories" ON categories;
CREATE POLICY "Public read categories"
  ON categories FOR SELECT USING (true);

ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read subcategories" ON subcategories;
CREATE POLICY "Public read subcategories"
  ON subcategories FOR SELECT USING (true);

-- ── DONE ─────────────────────────────────────────────────────────────────
-- After running this, test the flow:
--   1. Shop → Add to Cart → Checkout → Place Order
--   2. Check orders table: SELECT * FROM orders ORDER BY created_at DESC LIMIT 5;
--   3. Check items:        SELECT * FROM order_items ORDER BY created_at DESC LIMIT 10;
