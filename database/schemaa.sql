-- ====================================================================
-- 💎 JT COLLECTIONS: COMPLETE SRS SCHEMA (v2)
-- Safe to run multiple times. Run in Supabase SQL Editor.
-- ====================================================================

-- ── 1. CORE TABLES ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  email text UNIQUE,
  role text DEFAULT 'user',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text UNIQUE,
  description text,
  image_url text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS subcategories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text,
  description text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(category_id, name)
);

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE,
  description text,
  price numeric NOT NULL DEFAULT 0,
  discount_price numeric,
  old_price numeric,
  stock int NOT NULL DEFAULT 0,
  image_url text,
  images text[] DEFAULT '{}',
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  subcategory_id uuid REFERENCES subcategories(id) ON DELETE SET NULL,
  sizes text[] DEFAULT '{}',
  colors text[] DEFAULT '{}',
  fabric text,
  work text,
  pieces int DEFAULT 1,
  includes text[] DEFAULT '{}',
  care_instructions text,
  is_new_arrival boolean DEFAULT false,
  is_on_sale boolean DEFAULT false,
  season text,
  created_at timestamptz DEFAULT now()
);

-- ── 2. SRS CORE TABLES (NEW) ──────────────────────────────────────────────

-- Product Variations: size + color + stock + price_adjustment per SKU
CREATE TABLE IF NOT EXISTS product_variations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  color varchar(50),
  size varchar(10),
  stock int NOT NULL DEFAULT 0,
  price_adjustment int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Product Images: multiple images per product
CREATE TABLE IF NOT EXISTS product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cart (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  quantity int NOT NULL DEFAULT 1,
  selected_size text,
  selected_color text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  customer_name text NOT NULL DEFAULT 'Guest',
  phone text NOT NULL DEFAULT '',
  email text,
  address text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  postal_code text DEFAULT '',
  total_amount numeric NOT NULL DEFAULT 0,
  status text DEFAULT 'pending',
  payment_method text DEFAULT 'COD',
  payment_status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  variation_id uuid REFERENCES product_variations(id) ON DELETE SET NULL,
  quantity int NOT NULL,
  price numeric NOT NULL,
  size text,
  color text,
  created_at timestamptz DEFAULT now()
);

-- ── 3. SAFE ALTERATIONS (for existing databases) ─────────────────────────

-- Allow guest orders (user_id nullable)
ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name text NOT NULL DEFAULT 'Guest';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS phone text NOT NULL DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS address text NOT NULL DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS city text NOT NULL DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS postal_code text DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method text DEFAULT 'COD';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending';
ALTER TABLE categories ADD COLUMN IF NOT EXISTS slug text UNIQUE;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS slug text UNIQUE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS fabric text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS work text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS pieces int DEFAULT 1;
ALTER TABLE products ADD COLUMN IF NOT EXISTS includes text[] DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS care_instructions text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_new_arrival boolean DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_on_sale boolean DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS discount_price numeric;
ALTER TABLE products ADD COLUMN IF NOT EXISTS season text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS sizes text[] DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS colors text[] DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}';
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS variation_id uuid REFERENCES product_variations(id) ON DELETE SET NULL;
ALTER TABLE cart ADD COLUMN IF NOT EXISTS selected_size text;
ALTER TABLE cart ADD COLUMN IF NOT EXISTS selected_color text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'subcategory_id'
  ) THEN
    ALTER TABLE products ADD COLUMN subcategory_id uuid REFERENCES subcategories(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Safe rename 'total' → 'total_amount' if old schema
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='total') THEN
    ALTER TABLE orders RENAME COLUMN total TO total_amount;
  END IF;
END $$;

ALTER TABLE orders ALTER COLUMN total_amount TYPE numeric USING total_amount::numeric;

-- ── 4. SEED SRS CATEGORIES (11 categories, skip if exists) ───────────────

INSERT INTO categories (name, slug, description) VALUES
  ('Clothing', 'clothing', 'Women clothing collections for stitched and unstitched outfits'),
  ('Bottom Wear', 'bottom-wear', 'Trousers, palazzo, jeans and skirts for women'),
  ('Accessories', 'accessories', 'Dupatta, scarves and handbags for complete look'),
  ('Special', 'special', 'Trending edits including new arrivals and sale')
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug;

INSERT INTO subcategories (category_id, name, slug) VALUES
  ((SELECT id FROM categories WHERE slug = 'clothing'), 'Unstitched Suits', 'unstitched-suits'),
  ((SELECT id FROM categories WHERE slug = 'clothing'), 'Stitched Suits', 'stitched-suits'),
  ((SELECT id FROM categories WHERE slug = 'clothing'), '2-Piece Suits', '2-piece-suits'),
  ((SELECT id FROM categories WHERE slug = 'clothing'), '3-Piece Suits', '3-piece-suits'),
  ((SELECT id FROM categories WHERE slug = 'clothing'), 'Kurti / Tops', 'kurti-tops'),
  ((SELECT id FROM categories WHERE slug = 'clothing'), 'Maxi Dresses', 'maxi-dresses'),
  ((SELECT id FROM categories WHERE slug = 'clothing'), 'Abaya / Modest Wear', 'abaya-modest-wear'),
  ((SELECT id FROM categories WHERE slug = 'clothing'), 'Western Wear', 'western-wear'),
  ((SELECT id FROM categories WHERE slug = 'bottom-wear'), 'Trousers', 'trousers'),
  ((SELECT id FROM categories WHERE slug = 'bottom-wear'), 'Palazzo', 'palazzo'),
  ((SELECT id FROM categories WHERE slug = 'bottom-wear'), 'Jeans', 'jeans'),
  ((SELECT id FROM categories WHERE slug = 'bottom-wear'), 'Skirts', 'skirts'),
  ((SELECT id FROM categories WHERE slug = 'accessories'), 'Dupatta', 'dupatta'),
  ((SELECT id FROM categories WHERE slug = 'accessories'), 'Scarves', 'scarves'),
  ((SELECT id FROM categories WHERE slug = 'accessories'), 'Handbags', 'handbags'),
  ((SELECT id FROM categories WHERE slug = 'special'), 'New Arrivals', 'new-arrivals'),
  ((SELECT id FROM categories WHERE slug = 'special'), 'Sale', 'sale')
ON CONFLICT (category_id, name) DO NOTHING;

-- ── 5. ROW LEVEL SECURITY ─────────────────────────────────────────────────

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- Drop existing to avoid conflicts, then recreate
DROP POLICY IF EXISTS "Enable insert for everyone" ON orders;
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Enable insert for order items" ON order_items;
DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
DROP POLICY IF EXISTS "Public viewable products" ON products;
DROP POLICY IF EXISTS "Safe stock update" ON products;
DROP POLICY IF EXISTS "Public viewable variations" ON product_variations;
DROP POLICY IF EXISTS "Admin manage variations" ON product_variations;
DROP POLICY IF EXISTS "Public viewable images" ON product_images;
DROP POLICY IF EXISTS "Admin manage images" ON product_images;

CREATE POLICY "Enable insert for everyone" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Enable insert for order items" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own order items" ON order_items FOR SELECT USING (true);
CREATE POLICY "Public viewable products" ON products FOR SELECT USING (true);
CREATE POLICY "Safe stock update" ON products FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public viewable variations" ON product_variations FOR SELECT USING (true);
CREATE POLICY "Admin manage variations" ON product_variations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public viewable images" ON product_images FOR SELECT USING (true);
CREATE POLICY "Admin manage images" ON product_images FOR ALL USING (true) WITH CHECK (true);

-- ════════════════════════════════════════════════════════════════════
-- 👑 ADMIN SETUP (Run after signing up admin account)
-- ════════════════════════════════════════════════════════════════════

-- Update admin role for admin account
-- Uncomment and run after: http://localhost:5173/register

-- UPDATE public.profiles 
-- SET role = 'admin' 
-- WHERE id = (
--   SELECT id FROM auth.users 
--   WHERE email = 'admin@jtcollections.com'
-- );

-- Or run this dedicated file: ADMIN_ROLE_SETUP.sql

-- ════════════════════════════════════════════════════════════════════
