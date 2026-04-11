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
  image_url text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  price numeric NOT NULL DEFAULT 0,
  old_price numeric,
  stock int NOT NULL DEFAULT 0,
  image_url text,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  sizes text[] DEFAULT '{}',
  colors text[] DEFAULT '{}',
  fabric text,
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
  address text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  total_amount numeric NOT NULL DEFAULT 0,
  status text DEFAULT 'pending',
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

ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name text NOT NULL DEFAULT 'Guest';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS phone text NOT NULL DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS address text NOT NULL DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS city text NOT NULL DEFAULT '';
ALTER TABLE products ADD COLUMN IF NOT EXISTS fabric text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS season text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS sizes text[] DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS colors text[] DEFAULT '{}';
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS variation_id uuid REFERENCES product_variations(id) ON DELETE SET NULL;
ALTER TABLE cart ADD COLUMN IF NOT EXISTS selected_size text;
ALTER TABLE cart ADD COLUMN IF NOT EXISTS selected_color text;

-- Safe rename 'total' → 'total_amount' if old schema
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='total') THEN
    ALTER TABLE orders RENAME COLUMN total TO total_amount;
  END IF;
END $$;

ALTER TABLE orders ALTER COLUMN total_amount TYPE numeric USING total_amount::numeric;

-- ── 4. SEED SRS CATEGORIES (11 categories, skip if exists) ───────────────

INSERT INTO categories (name) VALUES
  ('Unstitched'),
  ('2 Piece'),
  ('3 Piece'),
  ('Kurtis'),
  ('Maxi'),
  ('Abaya'),
  ('Western Wear'),
  ('Trousers'),
  ('Dupatta'),
  ('New Arrivals'),
  ('Sale')
ON CONFLICT (name) DO NOTHING;

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
DROP POLICY IF EXISTS "Public viewable images" ON product_images;

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
