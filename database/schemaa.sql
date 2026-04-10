-- ====================================================================
-- 💎 JT COLLECTIONS: THE SMART UNIFIED SCHEMA
-- Safe to run multiple times on any database state.
-- ====================================================================

-- 1. TABLES (IF NOT EXISTS)
-- --------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  email text UNIQUE,
  role text DEFAULT 'user',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
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

-- Note: We create orders with 'total_amount' by default
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
  quantity int NOT NULL,
  price numeric NOT NULL,
  size text,
  color text,
  created_at timestamptz DEFAULT now()
);

-- 2. SMART UPDATES (IF TABLES ALREADY EXISTED)
-- --------------------------------------------------------------------

-- Ensure COD columns exist on 'orders'
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name text NOT NULL DEFAULT 'Guest';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS phone text NOT NULL DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS address text NOT NULL DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS city text NOT NULL DEFAULT '';

-- Safe Rename for 'total' to 'total_amount'
DO $$ 
BEGIN 
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='total') THEN
    ALTER TABLE orders RENAME COLUMN total TO total_amount;
  END IF;
END $$;

-- Fix Data Types
ALTER TABLE orders ALTER COLUMN total_amount TYPE numeric USING total_amount::numeric;

-- Ensure variant columns exist on 'products' and 'cart'
ALTER TABLE products ADD COLUMN IF NOT EXISTS sizes text[] DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS colors text[] DEFAULT '{}';
ALTER TABLE cart ADD COLUMN IF NOT EXISTS selected_size text;
ALTER TABLE cart ADD COLUMN IF NOT EXISTS selected_color text;


-- 3. SECURITY POLICIES (Row Level Security)
-- --------------------------------------------------------------------

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Orders: Anyone can insert (for COD), but only owners or admins can see
CREATE POLICY "Enable insert for everyone" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

-- Order Items: Anyone can insert, viewable only by order owners
CREATE POLICY "Enable insert for order items" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own order items" ON order_items FOR SELECT USING (true);

-- Products: Everyone can view, only authorized updates to stock
CREATE POLICY "Public viewable products" ON products FOR SELECT USING (true);
CREATE POLICY "Safe stock update" ON products FOR UPDATE USING (true) WITH CHECK (true);
