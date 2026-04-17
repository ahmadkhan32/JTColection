-- ================================================================
-- CART & ORDER FK FIX — Run in Supabase SQL Editor
-- Project: https://supabase.com/dashboard/project/xmssdsjhinitkykdpatb/sql
-- ================================================================
-- PROBLEM: cart.user_id references public.users which has password_hash NOT NULL
-- Supabase Auth users live in auth.users, NOT in public.users
-- SOLUTION: Re-point FK to auth.users directly
-- ================================================================

-- ── OPTION A (RECOMMENDED): Change FK to reference auth.users ────────────

-- 1. Fix cart → reference auth.users
ALTER TABLE cart DROP CONSTRAINT IF EXISTS cart_user_id_fkey;
ALTER TABLE cart
  ADD CONSTRAINT cart_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Fix orders → reference auth.users
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_user_id_fkey;
ALTER TABLE orders
  ADD CONSTRAINT orders_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- ── OPTION B (ALTERNATIVE): Just drop the FK entirely ────────────────────
-- Uncomment if Option A fails
-- ALTER TABLE cart DROP CONSTRAINT IF EXISTS cart_user_id_fkey;
-- ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_user_id_fkey;

-- ── RLS: cart — users can only see/modify their own rows ─────────────────
ALTER TABLE cart ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own cart"   ON cart;
DROP POLICY IF EXISTS "Users can insert own cart" ON cart;
DROP POLICY IF EXISTS "Users can update own cart" ON cart;
DROP POLICY IF EXISTS "Users can delete own cart" ON cart;

CREATE POLICY "Users can view own cart"   ON cart FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cart" ON cart FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cart" ON cart FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own cart" ON cart FOR DELETE USING (auth.uid() = user_id);

-- ── RLS: orders ───────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Enable insert for everyone" ON orders;
DROP POLICY IF EXISTS "Users can view own orders"  ON orders;
DROP POLICY IF EXISTS "Admin full access orders"   ON orders;

CREATE POLICY "Enable insert for everyone" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own orders"  ON orders FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Admin full access orders"   ON orders FOR ALL USING (true) WITH CHECK (true);

-- ── Verify FK targets ─────────────────────────────────────────────────────
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_schema || '.' || ccu.table_name AS foreign_table
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name IN ('cart', 'orders')
ORDER BY tc.table_name;
-- Expected: foreign_table = "auth.users" for both cart.user_id and orders.user_id
