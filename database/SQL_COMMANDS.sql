-- ╔══════════════════════════════════════════════════════════════════╗
-- ║         JT COLLECTIONS - READY-TO-EXECUTE SQL COMMANDS            ║
-- ║                    For Supabase SQL Editor                         ║
-- ╚══════════════════════════════════════════════════════════════════╝

-- ═══════════════════════════════════════════════════════════════════════
-- █ STEP 1: RUN FIRST - DATABASE SCHEMA MIGRATION
-- ═══════════════════════════════════════════════════════════════════════
-- 
-- Instructions:
--   1. Go to: https://supabase.com/dashboard/project/xmssdsjhinitkykdpatb/sql/new
--   2. Click "+ New Query"
--   3. Copy the content from: database/schemaa.sql
--   4. Paste it into Supabase SQL Editor
--   5. Click RUN button
--   6. Wait for completion
--
-- Expected: ✅ No errors, tables created
-- ═══════════════════════════════════════════════════════════════════════




-- ═══════════════════════════════════════════════════════════════════════
-- █ STEP 2: RUN SECOND - SEED PRODUCTS & CATEGORIES
-- ═══════════════════════════════════════════════════════════════════════
--
-- Instructions:
--   1. Create a NEW SQL query in Supabase
--   2. Copy the content from: supabase/seed/complete_seed.sql
--   3. Paste it into the new SQL query
--   4. Click RUN button
--   5. Wait for completion
--
-- Expected: ✅ No errors, 4 categories + 12 products inserted
-- ═══════════════════════════════════════════════════════════════════════




-- ═══════════════════════════════════════════════════════════════════════
-- █ STEP 3: CREATE ADMIN ACCOUNT
-- ═══════════════════════════════════════════════════════════════════════
--
-- Instructions:
--   1. Visit: http://localhost:5173/register
--   2. Sign up with:
--      - Email: admin@jtcollections.com
--      - Password: Admin@123456
--   3. Complete registration
--
-- This creates an auth user in Supabase
-- Expected: ✅ Auth user created
-- ═══════════════════════════════════════════════════════════════════════




-- ═══════════════════════════════════════════════════════════════════════
-- █ STEP 4: RUN THIRD - ASSIGN ADMIN ROLE
-- ═══════════════════════════════════════════════════════════════════════
--
-- Instructions:
--   1. Create a NEW SQL query in Supabase
--   2. Copy and PASTE the SQL below
--   3. Click RUN button
--
-- COPY THIS SQL:

UPDATE public.profiles 
SET role = 'admin' 
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email = 'admin@jtcollections.com'
);

-- Expected: ✅ "1 row updated" message
-- ═══════════════════════════════════════════════════════════════════════




-- ═══════════════════════════════════════════════════════════════════════
-- █ STEP 5: VERIFICATION QUERIES (Optional - Check if setup worked)
-- ═══════════════════════════════════════════════════════════════════════

-- Check 1: Verify Categories Created (should show 4)
SELECT id, name, description 
FROM public.categories 
ORDER BY name;

-- Check 2: Verify Products Created (should show 12)
SELECT title, price, old_price, stock, category_id
FROM public.products 
LIMIT 12;

-- Check 3: Verify Admin Role Assigned
SELECT 
  u.id, 
  u.email, 
  p.role, 
  p.created_at
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'admin@jtcollections.com'
   OR p.role = 'admin';

-- Check 4: Verify Product Variations Created
SELECT COUNT(*) as variation_count
FROM public.product_variations;

-- Check 5: Verify Schema Tables Exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- ═══════════════════════════════════════════════════════════════════════




-- ═══════════════════════════════════════════════════════════════════════
-- █ TROUBLESHOOTING QUERIES
-- ═══════════════════════════════════════════════════════════════════════

-- If orders not showing in admin panel, check:
SELECT id, customer_name, status, created_at
FROM public.orders
ORDER BY created_at DESC;

-- If RLS policies blocking access, check:
SELECT * FROM pg_policies 
WHERE tablename = 'orders';

-- Check all RLS policies
SELECT tablename, policyname, qual
FROM pg_policies;

-- Verify auth user exists:
SELECT 
  u.id, 
  u.email, 
  p.role
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id;

-- ═══════════════════════════════════════════════════════════════════════




-- ═══════════════════════════════════════════════════════════════════════
-- █ QUICK REFERENCE
-- ═══════════════════════════════════════════════════════════════════════

-- Frontend URLs:
-- - Shop:        http://localhost:5173/shop
-- - Checkout:    http://localhost:5173/checkout
-- - Admin:       http://localhost:5173/admin/orders
-- - Register:    http://localhost:5173/register

-- Test Account:
-- - Email:       admin@jtcollections.com
-- - Password:    Admin@123456

-- Supabase URLs:
-- - Dashboard:   https://supabase.com/dashboard
-- - Project:     https://xmssdsjhinitkykdpatb.supabase.co
-- - SQL Editor:  https://supabase.com/dashboard/project/xmssdsjhinitkykdpatb/sql

-- ═══════════════════════════════════════════════════════════════════════
-- All setup files:
-- - EXECUTION_GUIDE.md           ← Start here! (Complete instructions)
-- - COMPLETE_SETUP.md            ← Detailed step-by-step guide
-- - ADMIN_DATABASE_SETUP.md      ← Admin config details
-- - SETUP_GUIDE.md               ← Environment setup
-- - ORDER_IMPLEMENTATION_GUIDE   ← Architecture reference
-- ═══════════════════════════════════════════════════════════════════════




-- ═══════════════════════════════════════════════════════════════════════
-- █ PRODUCT FULL CRUD SQL QUERIES (Admin Panel)
--   Run these in Supabase SQL Editor as needed
-- ═══════════════════════════════════════════════════════════════════════

-- ── ADD MISSING COLUMNS (run once, safe to re-run) ─────────────────
ALTER TABLE public.users    ADD COLUMN IF NOT EXISTS username   TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username   TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();


-- ── PRODUCTS ─────────────────────────────────────────────────────────

-- READ: Get all products with category + subcategory names
SELECT
  p.id,
  p.title,
  p.slug,
  p.price,
  p.old_price,
  p.discount_price,
  p.stock,
  p.image_url,
  p.images,
  p.sizes,
  p.colors,
  p.fabric,
  p.work,
  p.pieces,
  p.includes,
  p.care_instructions,
  p.is_new_arrival,
  p.is_on_sale,
  p.created_at,
  c.name  AS category_name,
  c.slug  AS category_slug,
  s.name  AS subcategory_name
FROM public.products p
LEFT JOIN public.categories    c ON c.id = p.category_id
LEFT JOIN public.subcategories s ON s.id = p.subcategory_id
ORDER BY p.created_at DESC;


-- READ: Get single product with variations and images
-- (uses the most-recently created product — replace the subquery with a real id if needed)
SELECT
  p.*,
  c.name  AS category_name,
  s.name  AS subcategory_name
FROM public.products p
LEFT JOIN public.categories    c ON c.id = p.category_id
LEFT JOIN public.subcategories s ON s.id = p.subcategory_id
WHERE p.id = (SELECT id FROM public.products ORDER BY created_at DESC LIMIT 1);

SELECT * FROM public.product_variations
  WHERE product_id = (SELECT id FROM public.products ORDER BY created_at DESC LIMIT 1);

SELECT * FROM public.product_images
  WHERE product_id = (SELECT id FROM public.products ORDER BY created_at DESC LIMIT 1)
  ORDER BY sort_order;


-- CREATE: Insert a new product
-- ON CONFLICT (slug) DO UPDATE ensures re-running this query never throws a duplicate-key error.
INSERT INTO public.products (
  title, slug, description,
  price, old_price, discount_price,
  category_id, subcategory_id,
  stock, image_url, images,
  sizes, colors,
  fabric, work, pieces, includes, care_instructions,
  is_new_arrival, is_on_sale
) VALUES (
  'New Embroidered Lawn Set',
  'new-embroidered-lawn-set-' || to_char(now(), 'YYYYMMDDHH24MISS'),
  'Premium 3-piece luxury lawn suit with hand embroidery.',
  4500, 5500, 4200,
  (SELECT id FROM public.categories ORDER BY name LIMIT 1), NULL,
  50, 'https://example.com/image.jpg', ARRAY['https://example.com/img2.jpg'],
  ARRAY['S','M','L','XL'], ARRAY['White','Maroon'],
  'Lawn', 'Embroidery', 3, ARRAY['Shirt','Shalwar','Dupatta'], 'Hand wash only.',
  true, false
)
ON CONFLICT (slug) DO UPDATE
  SET
    price      = EXCLUDED.price,
    stock      = EXCLUDED.stock,
    updated_at = now()
RETURNING *;


-- UPDATE: Update price and stock
-- Replace the subquery with a specific product id when targeting a particular row
UPDATE public.products
SET
  price      = 4800,
  stock      = 45,
  is_on_sale = true
WHERE id = (SELECT id FROM public.products ORDER BY created_at DESC LIMIT 1)
RETURNING *;


-- UPDATE: Mark as new arrival
UPDATE public.products
SET is_new_arrival = true
WHERE id = (SELECT id FROM public.products ORDER BY created_at DESC LIMIT 1);


-- DELETE: Remove product (cascades to variations + images).
-- ⚠  Run each line separately after replacing the subquery with the real product id.
-- DO NOT run as-is unless you are sure which product to target.
--
-- Step 1 — find the product you want to delete:
--   SELECT id, title FROM public.products ORDER BY created_at DESC;
--
-- Step 2 — paste that id below and run:
--   DELETE FROM public.product_variations WHERE product_id = '<paste-real-uuid-here>';
--   DELETE FROM public.product_images     WHERE product_id = '<paste-real-uuid-here>';
--   DELETE FROM public.products           WHERE id         = '<paste-real-uuid-here>';


-- ── PRODUCT VARIATIONS ───────────────────────────────────────────────

-- READ: All variations for a product with computed final price
SELECT
  pv.id,
  pv.color,
  pv.size,
  pv.stock,
  pv.price_adjustment,
  (p.price + pv.price_adjustment) AS final_price
FROM public.product_variations pv
JOIN public.products p ON p.id = pv.product_id
WHERE pv.product_id = (SELECT id FROM public.products ORDER BY created_at DESC LIMIT 1)
ORDER BY pv.size, pv.color;


-- CREATE: Add a variation
INSERT INTO public.product_variations (product_id, color, size, stock, price_adjustment)
VALUES (
  (SELECT id FROM public.products ORDER BY created_at DESC LIMIT 1),
  'Black', 'M', 20, 0
)
RETURNING *;


-- UPDATE: Adjust stock after sale
UPDATE public.product_variations
SET stock = GREATEST(0, stock - 1)
WHERE id = (SELECT id FROM public.product_variations ORDER BY id LIMIT 1)
RETURNING *;


-- DELETE: Remove a single variation
-- ⚠  Replace the subquery with the specific variation id you want to delete:
--   SELECT id, color, size FROM public.product_variations;
DELETE FROM public.product_variations
WHERE id = (SELECT id FROM public.product_variations ORDER BY id LIMIT 1);


-- ── CATEGORIES ───────────────────────────────────────────────────────

-- READ: All categories with subcategory count
SELECT
  c.id,
  c.name,
  c.slug,
  COUNT(s.id) AS subcategory_count,
  COUNT(p.id) AS product_count
FROM public.categories c
LEFT JOIN public.subcategories s ON s.category_id = c.id
LEFT JOIN public.products      p ON p.category_id = c.id
GROUP BY c.id, c.name, c.slug
ORDER BY c.name;


-- CREATE: New category
INSERT INTO public.categories (name, slug, description)
VALUES ('Winter Collection', 'winter-collection', 'Warm luxury fabrics for winter.')
RETURNING *;


-- UPDATE: Rename category
-- Replace the subquery with the specific category id you want to rename.
UPDATE public.categories
SET name = 'Winter Luxury', slug = 'winter-luxury'
WHERE id = (SELECT id FROM public.categories WHERE name = 'Winter Collection' LIMIT 1)
RETURNING *;


-- DELETE: Safe delete (only if no products linked)
-- ⚠  Replace the subquery with the real category id:
--   SELECT id, name FROM public.categories;
DELETE FROM public.categories
WHERE id = (SELECT id FROM public.categories WHERE name = 'Winter Luxury' LIMIT 1)
  AND NOT EXISTS (
    SELECT 1 FROM public.products p
    WHERE p.category_id = (
      SELECT id FROM public.categories WHERE name = 'Winter Luxury' LIMIT 1
    )
  );


-- ── USERS ROSTER ─────────────────────────────────────────────────────

-- READ: All users with role (for dashboard)
SELECT
  u.id,
  u.name,
  u.username,
  u.email,
  u.role,
  u.created_at
FROM public.users u
ORDER BY u.created_at DESC;


-- UPDATE: Set user as admin
UPDATE public.users
SET role = 'admin'
WHERE email = 'admin@jtcollections.com';

UPDATE public.profiles
SET role = 'admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@jtcollections.com');


-- UPDATE: Set username for a user
UPDATE public.users
SET username = 'jtadmin'
WHERE email = 'admin@jtcollections.com';

-- ═══════════════════════════════════════════════════════════════════════
