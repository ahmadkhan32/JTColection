-- ================================================================
-- JT COLLECTIONS: PRODUCTION SETUP SQL  (v1 – safe to re-run)
-- Run in: Supabase Dashboard → SQL Editor → New Query → Paste → Run
-- ================================================================

-- ── 1. MAKE IMAGES BUCKET PUBLIC ──────────────────────────────
UPDATE storage.buckets
SET    public = true
WHERE  id = 'IMAGES';

-- ── 2. STORAGE RLS POLICIES ───────────────────────────────────
-- Public read: anyone can view uploaded images
DROP POLICY IF EXISTS "IMAGES public read"  ON storage.objects;
CREATE POLICY "IMAGES public read"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'IMAGES');

-- Service-role uploads via signed URLs bypass RLS automatically.
-- Add anon/authenticated upload policy only if direct (non-signed) uploads are needed.
DROP POLICY IF EXISTS "IMAGES authenticated upload" ON storage.objects;
CREATE POLICY "IMAGES authenticated upload"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'IMAGES');

-- Service-role delete (admin deleting product images)
DROP POLICY IF EXISTS "IMAGES service role delete" ON storage.objects;
CREATE POLICY "IMAGES service role delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'IMAGES');

-- ── 3. ENABLE RLS ON MAIN TABLES ──────────────────────────────
ALTER TABLE products           ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories         ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories      ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images     ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders             ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items        ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart               ENABLE ROW LEVEL SECURITY;

-- ── 4. PUBLIC READ POLICIES (anon key frontend reads) ─────────
-- Products: everyone can browse
DROP POLICY IF EXISTS "products_public_read" ON products;
CREATE POLICY "products_public_read"
  ON products FOR SELECT TO public USING (true);

-- Categories: everyone can browse
DROP POLICY IF EXISTS "categories_public_read" ON categories;
CREATE POLICY "categories_public_read"
  ON categories FOR SELECT TO public USING (true);

-- Subcategories: everyone can browse
DROP POLICY IF EXISTS "subcategories_public_read" ON subcategories;
CREATE POLICY "subcategories_public_read"
  ON subcategories FOR SELECT TO public USING (true);

-- Product variations: everyone can browse (needed for stock check)
DROP POLICY IF EXISTS "variations_public_read" ON product_variations;
CREATE POLICY "variations_public_read"
  ON product_variations FOR SELECT TO public USING (true);

-- Product images: everyone can view
DROP POLICY IF EXISTS "product_images_public_read" ON product_images;
CREATE POLICY "product_images_public_read"
  ON product_images FOR SELECT TO public USING (true);

-- Order items: public read (for order confirmation pages)
DROP POLICY IF EXISTS "order_items_public_read" ON order_items;
CREATE POLICY "order_items_public_read"
  ON order_items FOR SELECT TO public USING (true);

-- ── 5. CART POLICIES (per-user) ───────────────────────────────
DROP POLICY IF EXISTS "cart_owner_select" ON cart;
CREATE POLICY "cart_owner_select"
  ON cart FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "cart_owner_insert" ON cart;
CREATE POLICY "cart_owner_insert"
  ON cart FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "cart_owner_update" ON cart;
CREATE POLICY "cart_owner_update"
  ON cart FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "cart_owner_delete" ON cart;
CREATE POLICY "cart_owner_delete"
  ON cart FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- ── 6. ORDERS POLICIES ───────────────────────────────────────
-- Guest checkout: anyone can INSERT an order (no auth required)
DROP POLICY IF EXISTS "orders_public_insert" ON orders;
CREATE POLICY "orders_public_insert"
  ON orders FOR INSERT TO public WITH CHECK (true);

-- Authenticated users can read their own orders
DROP POLICY IF EXISTS "orders_owner_read" ON orders;
CREATE POLICY "orders_owner_read"
  ON orders FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR user_id IS NULL);

-- Public can insert order_items (for guest checkout)
DROP POLICY IF EXISTS "order_items_public_insert" ON order_items;
CREATE POLICY "order_items_public_insert"
  ON order_items FOR INSERT TO public WITH CHECK (true);

-- ── 7. AUTO-UPDATE updated_at ON products ─────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS products_updated_at ON products;
CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── 8. ENSURE product_images TABLE EXISTS ─────────────────────
-- (already in schemaa.sql but safe to re-run)
CREATE TABLE IF NOT EXISTS product_images (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url  text NOT NULL,
  sort_order int  NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_product_images_product_id
  ON product_images (product_id, sort_order);

CREATE INDEX IF NOT EXISTS idx_product_variations_product_id
  ON product_variations (product_id);

-- ── 9. SEED CATEGORIES (idempotent) ───────────────────────────
INSERT INTO categories (name, slug, description) VALUES
  ('Clothing',    'clothing',    'Women clothing collections for stitched and unstitched outfits'),
  ('Bottom Wear', 'bottom-wear', 'Trousers, palazzo, jeans and skirts for women'),
  ('Accessories', 'accessories', 'Dupatta, scarves and handbags for complete look'),
  ('Special',     'special',     'Trending edits including new arrivals and sale')
ON CONFLICT (name) DO UPDATE SET
  slug        = EXCLUDED.slug,
  description = EXCLUDED.description;

-- ── 10. VERIFICATION QUERY ────────────────────────────────────
-- After running, this should show all 4 categories:
SELECT 'categories' AS tbl, COUNT(*) FROM categories
UNION ALL
SELECT 'products',   COUNT(*) FROM products
UNION ALL
SELECT 'product_images', COUNT(*) FROM product_images
UNION ALL
SELECT 'product_variations', COUNT(*) FROM product_variations;
