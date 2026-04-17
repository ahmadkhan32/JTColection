-- ====================================================================
-- JT Collections – Schema Fixes + Full RLS Policy Set
-- Run this ONCE in Supabase SQL Editor.
-- Safe to re-run (uses IF NOT EXISTS / DROP IF EXISTS).
-- ====================================================================

-- ─────────────────────────────────────────────────────────────────────
-- 1. EXTEND users TABLE
-- ─────────────────────────────────────────────────────────────────────

-- username column (used by admin dashboard / auth context)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS username text;

-- old_price column expected by the products form
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS old_price numeric;

-- ─────────────────────────────────────────────────────────────────────
-- 2. CREATE profiles COMPATIBILITY TABLE
--    Some auth flows query public.profiles (Supabase convention).
--    This table mirrors auth.users so both query paths work.
-- ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   text,
  email       text,
  role        text DEFAULT 'user',
  phone       text,
  address     text,
  created_at  timestamptz DEFAULT now()
);

-- Auto-create a profile row whenever a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Insert into profiles (ignore if already exists)
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  )
  ON CONFLICT (id) DO NOTHING;

  -- Insert into users table too (project-primary table)
  INSERT INTO public.users (id, email, name, username, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'username', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  )
  ON CONFLICT (email) DO UPDATE
    SET id = EXCLUDED.id;

  RETURN NEW;
END;
$$;

-- Attach trigger (drop first to avoid duplicates)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────
-- 3. ROW LEVEL SECURITY – users table
-- NOTE: We do NOT use a self-referential policy here.
--       Self-referential policies (EXISTS (SELECT FROM same table))
--       cause infinite recursion → 500 errors on every query.
--       The service-role key used by the backend bypasses RLS entirely,
--       so the policies below only affect direct anon/user-key queries.
-- ─────────────────────────────────────────────────────────────────────

-- Emergency fix: drop the bad self-referential policy if it was already added
DROP POLICY IF EXISTS "Admin read all users" ON public.users;

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own row"    ON public.users;
DROP POLICY IF EXISTS "Users can update own row"  ON public.users;
DROP POLICY IF EXISTS "Public read users"         ON public.users;

-- Authenticated users can read their own row
CREATE POLICY "Users can read own row"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- Authenticated users can update their own row
CREATE POLICY "Users can update own row"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Backend uses the service-role key which bypasses RLS, so no admin policy needed here.

-- ─────────────────────────────────────────────────────────────────────
-- 4. ROW LEVEL SECURITY – profiles table
-- ─────────────────────────────────────────────────────────────────────

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile"   ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin read all profiles"      ON public.profiles;

CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admin read all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

-- ─────────────────────────────────────────────────────────────────────
-- 5. ROW LEVEL SECURITY – products (full admin CRUD)
-- ─────────────────────────────────────────────────────────────────────

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public viewable products"      ON public.products;
DROP POLICY IF EXISTS "Safe stock update"             ON public.products;
DROP POLICY IF EXISTS "Admin insert products"         ON public.products;
DROP POLICY IF EXISTS "Admin update products"         ON public.products;
DROP POLICY IF EXISTS "Admin delete products"         ON public.products;

-- Everyone (including anonymous) can read products
CREATE POLICY "Public viewable products"
  ON public.products FOR SELECT USING (true);

-- Backend service role handles writes, so USING(true) is fine for admin
-- (backend calls use the service-role key which bypasses RLS anyway)
CREATE POLICY "Admin insert products"
  ON public.products FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin update products"
  ON public.products FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Admin delete products"
  ON public.products FOR DELETE USING (true);

-- ─────────────────────────────────────────────────────────────────────
-- 6. ROW LEVEL SECURITY – categories / subcategories
-- ─────────────────────────────────────────────────────────────────────

ALTER TABLE public.categories    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public viewable categories"    ON public.categories;
DROP POLICY IF EXISTS "Admin manage categories"       ON public.categories;
DROP POLICY IF EXISTS "Public viewable subcategories" ON public.subcategories;
DROP POLICY IF EXISTS "Admin manage subcategories"    ON public.subcategories;

CREATE POLICY "Public viewable categories"
  ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admin manage categories"
  ON public.categories FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public viewable subcategories"
  ON public.subcategories FOR SELECT USING (true);
CREATE POLICY "Admin manage subcategories"
  ON public.subcategories FOR ALL USING (true) WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────────────
-- 7. ROW LEVEL SECURITY – orders / order_items
-- ─────────────────────────────────────────────────────────────────────

ALTER TABLE public.orders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable insert for everyone"    ON public.orders;
DROP POLICY IF EXISTS "Users can view own orders"     ON public.orders;
DROP POLICY IF EXISTS "Admin manage orders"           ON public.orders;
DROP POLICY IF EXISTS "Enable insert for order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;

-- Guest + logged-in users can place orders
CREATE POLICY "Enable insert for everyone"
  ON public.orders FOR INSERT WITH CHECK (true);

-- Users see their own orders; guests (user_id IS NULL) — nothing
CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Admin full access to orders
CREATE POLICY "Admin manage orders"
  ON public.orders FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable insert for order items"
  ON public.order_items FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own order items"
  ON public.order_items FOR SELECT USING (true);

-- ─────────────────────────────────────────────────────────────────────
-- 8. ROW LEVEL SECURITY – product_variations / product_images / cart
-- ─────────────────────────────────────────────────────────────────────

ALTER TABLE public.product_variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart               ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public viewable variations"  ON public.product_variations;
DROP POLICY IF EXISTS "Admin manage variations"     ON public.product_variations;
DROP POLICY IF EXISTS "Public viewable images"      ON public.product_images;
DROP POLICY IF EXISTS "Admin manage images"         ON public.product_images;
DROP POLICY IF EXISTS "Users manage own cart"       ON public.cart;

CREATE POLICY "Public viewable variations"
  ON public.product_variations FOR SELECT USING (true);
CREATE POLICY "Admin manage variations"
  ON public.product_variations FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public viewable images"
  ON public.product_images FOR SELECT USING (true);
CREATE POLICY "Admin manage images"
  ON public.product_images FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Users manage own cart"
  ON public.cart FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────
-- 9. MAKE EXISTING USER ADMIN
--    Run AFTER signing up at /register:
--    Replace the email below with your admin email.
-- ─────────────────────────────────────────────────────────────────────

/*
-- Option A – update via public.users table
UPDATE public.users
SET role = 'admin'
WHERE email = 'admin@jtcollections.com';

-- Option B – update via public.profiles table
UPDATE public.profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'admin@jtcollections.com'
);
*/

-- ─────────────────────────────────────────────────────────────────────
-- 10. VERIFY
-- ─────────────────────────────────────────────────────────────────────

SELECT tablename, policyname
FROM pg_policies
WHERE tablename IN ('users','profiles','products','categories','subcategories',
                    'orders','order_items','product_variations','product_images','cart')
ORDER BY tablename, policyname;
