-- ════════════════════════════════════════════════════════════════════
-- ⚡ JT COLLECTIONS - QUICK VERIFICATION (Copy & Paste Ready)
-- ✅ All queries fixed for Supabase compatibility
-- ════════════════════════════════════════════════════════════════════

-- 🚀 RUN THESE IN ORDER AFTER EACH STEP:

-- ════════════════════════════════════════════════════════════════════
-- 1️⃣ AFTER Running schema.sql
-- ════════════════════════════════════════════════════════════════════

SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Expected: 10 tables (cart, categories, order_items, orders, product_images, product_variations, products, profiles, users, wishlist)

-- ════════════════════════════════════════════════════════════════════
-- 2️⃣ AFTER Running complete_seed.sql
-- ════════════════════════════════════════════════════════════════════

SELECT COUNT(*) as total_categories FROM public.categories;
-- Expected: 4

SELECT COUNT(*) as total_products FROM public.products;
-- Expected: 12

SELECT COUNT(*) as total_variations FROM public.product_variations;
-- Expected: 24+

-- ════════════════════════════════════════════════════════════════════
-- 3️⃣ AFTER User Registration at http://localhost:5173/register
-- ════════════════════════════════════════════════════════════════════

SELECT id, email, created_at
FROM auth.users
WHERE email = 'admin@jtcollections.com';

-- Expected: 1 row with UUID

SELECT id, name, role, created_at
FROM public.profiles
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email = 'admin@jtcollections.com'
);

-- Expected: 1 row with role = 'user'

-- ════════════════════════════════════════════════════════════════════
-- 4️⃣ RUN THIS SQL TO ASSIGN ADMIN ROLE
-- (Copy & paste ONLY this query in its own SQL editor tab)
-- ════════════════════════════════════════════════════════════════════

UPDATE public.profiles 
SET role = 'admin' 
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email = 'admin@jtcollections.com'
);

-- Expected: "1 row updated" message

-- ════════════════════════════════════════════════════════════════════
-- 5️⃣ VERIFY ADMIN ROLE WAS ASSIGNED
-- ════════════════════════════════════════════════════════════════════

SELECT 
  u.id,
  u.email,
  p.name,
  p.role,
  p.created_at
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'admin@jtcollections.com';

-- Expected: 1 row with role = 'admin' ✅

-- ════════════════════════════════════════════════════════════════════
-- 6️⃣ VERIFY RLS POLICIES
-- ════════════════════════════════════════════════════════════════════

SELECT COUNT(*) as total_policies
FROM pg_policies
WHERE schemaname = 'public';

-- Expected: 21 RLS policies

-- ════════════════════════════════════════════════════════════════════
-- 7️⃣ FINAL SYSTEM STATUS (Run this to see everything)
-- ════════════════════════════════════════════════════════════════════

SELECT 
  (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public') as table_count,
  (SELECT COUNT(*) FROM public.categories) as categories_count,
  (SELECT COUNT(*) FROM public.products) as products_count,
  (SELECT COUNT(*) FROM public.product_variations) as variations_count,
  (SELECT COUNT(*) FROM auth.users WHERE email = 'admin@jtcollections.com') as admin_account_exists,
  (SELECT COALESCE(role, 'NOT_FOUND') FROM public.profiles WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@jtcollections.com' LIMIT 1)) as admin_role,
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') as rls_policies_count;

-- ✅ SUCCESS if all values match:
-- table_count: 10
-- categories_count: 4
-- products_count: 12
-- variations_count: 24+
-- admin_account_exists: 1
-- admin_role: 'admin'
-- rls_policies_count: 21

-- ════════════════════════════════════════════════════════════════════
-- 8️⃣ TEST ADMIN DASHBOARD 
-- ════════════════════════════════════════════════════════════════════

-- View all users (admin can see, regular users can't)
SELECT p.id, u.email, p.name, p.phone, p.role
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
ORDER BY p.created_at DESC;

-- View all orders (admin can see all, users see only theirs)
SELECT id, user_id, customer_name, phone, address, status, total_amount, created_at
FROM public.orders
ORDER BY created_at DESC
LIMIT 10;

-- View all products
SELECT id, title, price, old_price, stock, category_id
FROM public.products
ORDER BY created_at DESC;

-- ════════════════════════════════════════════════════════════════════
-- ✅ IF ALL ABOVE QUERIES WORK, YOUR SYSTEM IS READY!
-- ════════════════════════════════════════════════════════════════════
--
-- Next: Test the application:
-- 1. Browse: http://localhost:5173/shop
-- 2. Add to cart
-- 3. Login and checkout
-- 4. View orders in admin: http://localhost:5173/admin/orders
--
-- ════════════════════════════════════════════════════════════════════
