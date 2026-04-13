-- ════════════════════════════════════════════════════════════════════
-- 🔍 JT COLLECTIONS - VERIFICATION QUERIES
-- ✅ Supabase SQL Editor Compatible
-- Run these queries step-by-step in Supabase to verify complete setup
-- ════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════
-- STEP 1: VERIFY DATABASE SCHEMA (Run FIRST after schema.sql)
-- ═══════════════════════════════════════════════════════════════════
-- 📍 Location: Supabase Dashboard → SQL Editor → New Query
-- 📋 Action: Copy query below → Paste in Editor → Click RUN

-- ✅ Query 1.1: Check if all 10 tables were created
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Expected Result: 10 rows in this order:
-- 1. cart
-- 2. categories
-- 3. order_items
-- 4. orders
-- 5. product_images
-- 6. product_variations
-- 7. products
-- 8. profiles
-- 9. users
-- 10. wishlist

-- ❌ If you see fewer than 10 tables:
--    → Run supabase/migrations/schema.sql again
--    → Check for errors in Supabase SQL Editor output

-- ═══════════════════════════════════════════════════════════════════
-- 1.2: Verify Table Structure - Profiles
-- ═══════════════════════════════════════════════════════════════════

SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Expected Columns: id, name, phone, address, avatar_url, role, created_at

-- ═══════════════════════════════════════════════════════════════════
-- 1.3: Verify Table Structure - Products
-- ═══════════════════════════════════════════════════════════════════

SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'products'
ORDER BY ordinal_position;

-- Expected Columns: id, title, description, price, old_price, stock, 
-- image_url, category_id, sizes, colors, fabric, season, created_at

-- ═══════════════════════════════════════════════════════════════════
-- STEP 2: VERIFY SEED DATA (Run SECOND after complete_seed.sql)
-- ═══════════════════════════════════════════════════════════════════
-- 📍 Location: Supabase Dashboard → SQL Editor → New Query
-- 📋 Action: Copy each query → Paste → Click RUN

-- ✅ Query 2.1: Count all categories
SELECT COUNT(*) as total_categories FROM public.categories;
-- Expected: 4 ✅

-- ✅ Query 2.2: Count all products
SELECT COUNT(*) as total_products FROM public.products;
-- Expected: 12 ✅

-- ✅ Query 2.3: View all categories
SELECT id, name, description, image_url
FROM public.categories 
ORDER BY name;

-- Expected Categories (4 rows):
-- - Women: Elegant clothing for the modern woman
-- - Men: Premium menswear collection
-- - Accessories: Luxury handbags and designer complements
-- - Footwear: Comfortable and stylish shoes

-- ✅ Query 2.4: View all products with categories
SELECT 
  p.id,
  p.title,
  p.price,
  p.old_price,
  p.stock,
  c.name as category
FROM public.products p
JOIN public.categories c ON p.category_id = c.id
ORDER BY c.name, p.title;

-- Expected: 12 products (Women: 4, Men: 4, Accessories: 2, Footwear: 2)

-- ✅ Query 2.5: Count product variations
SELECT COUNT(*) as total_variations FROM public.product_variations;
-- Expected: 24+ variations (2+ per product) ✅

-- ❌ If counts are wrong:
--    → Run supabase/seed/complete_seed.sql again
--    → Check Supabase SQL output for errors

-- ═══════════════════════════════════════════════════════════════════
-- STEP 3: VERIFY AUTH & REGISTRATION (Run THIRD after signup)
-- ═══════════════════════════════════════════════════════════════════
-- 📍 Location: http://localhost:5173/register (signup first)
-- ✅ Then run these queries in Supabase SQL Editor

-- ✅ Query 3.1: Check if admin user was created in auth.users
SELECT id, email, created_at, last_sign_in_at
FROM auth.users
WHERE email = 'admin@jtcollections.com';

-- Expected: 1 row with your UUID and signup timestamp
-- Example output:
-- id: | 550e8400-e29b-41d4-a716-446655440000
-- email: | admin@jtcollections.com
-- created_at: | 2026-04-13 10:30:00+00
-- last_sign_in_at: | 2026-04-13 10:30:05+00

-- ✅ Query 3.2: Check if profile was created automatically
SELECT id, name, phone, address, role, created_at
FROM public.profiles
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email = 'admin@jtcollections.com'
);

-- Expected: 1 row with role = 'user' (will be changed to 'admin' in STEP 4)
-- This profile is created automatically by the trigger: handle_new_user()

-- ❌ Troubleshooting:
--    If you see 0 rows for Query 3.2:
--    → The trigger might have failed
--    → Try logging out and back in
--    → Or check Supabase logs for errors

-- ═══════════════════════════════════════════════════════════════════
-- STEP 4: VERIFY ADMIN ROLE ASSIGNMENT (Run FOURTH after role update)
-- ═══════════════════════════════════════════════════════════════════
-- 📍 First, run this SQL to assign admin role:
--    UPDATE public.profiles SET role = 'admin' 
--    WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@jtcollections.com');
-- ✅ Then run the verification queries below

-- ✅ Query 4.1: Check admin role was assigned correctly
SELECT 
  u.id,
  u.email,
  p.name,
  p.role,
  p.created_at
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'admin@jtcollections.com';

-- Expected: 1 row with role = 'admin' ✅
-- Example output:
-- id: | 550e8400-e29b-41d4-a716-446655440000
-- email: | admin@jtcollections.com
-- name: | Admin
-- role: | admin ✅ (This is what we want!)
-- created_at: | 2026-04-13 10:30:00+00

-- ✅ Query 4.2: View all admin users in system
SELECT 
  u.id,
  u.email,
  p.name,
  p.role,
  p.created_at
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE p.role IN ('admin', 'super_admin')
ORDER BY p.created_at DESC;

-- Expected: At least 1 row with admin@jtcollections.com having role = 'admin'

-- ❌ If role is still 'user':
--    → Run the UPDATE query above in new SQL Editor
--    → Make sure you get "1 row updated" message
--    → Then run Query 4.1 again to verify

-- ═══════════════════════════════════════════════════════════════════
-- STEP 5: VERIFY RLS POLICIES (Run FIFTH to confirm security)
-- ═══════════════════════════════════════════════════════════════════
-- 📍 These queries verify Row Level Security is working correctly

-- ✅ Query 5.1: Check all public tables are listed
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Expected: 10 tables should be listed

-- ✅ Query 5.2: Count total RLS policies
SELECT COUNT(*) as total_policies
FROM pg_policies
WHERE schemaname = 'public';

-- Expected: 20+ policies ✅
-- (Exactly 21 policies for full security)

-- ✅ Query 5.3: View all RLS policies by table
SELECT schemaname, tablename, policyname, permissive, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Expected output sample:
-- Table: cart → 4 policies (SELECT, INSERT, UPDATE, DELETE for user)
-- Table: categories → 2 policies (SELECT for all, ALL for admin)
-- Table: orders → 4 policies (SELECT user own + admin all, INSERT, UPDATE admin)
-- Table: products → 4 policies (SELECT for all, INSERT/UPDATE/DELETE for admin)
-- ... and more

-- ❌ If you see fewer than 20 policies:
--    → Re-run schema.sql (policies might not have been created)
--    → Check Supabase logs for errors

-- ═══════════════════════════════════════════════════════════════════
-- STEP 6: TEST ADMIN PERMISSIONS (Run SIXTH to verify access control)
-- ═══════════════════════════════════════════════════════════════════
-- 📍 Run after admin login at: http://localhost:5173/login
-- ✅ These queries test if admin can access protected data

-- ✅ Query 6.1: Admin viewing all users (should work)
SELECT p.id, u.email, p.name, p.phone, p.role
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
ORDER BY p.created_at DESC;

-- Expected: Multiple rows including admin@jtcollections.com
-- Regular users would only see their own profile (RLS blocks others)

-- ✅ Query 6.2: Admin viewing all orders (should work)
SELECT id, user_id, customer_name, phone, address, status, total_amount, created_at
FROM public.orders
ORDER BY created_at DESC
LIMIT 10;

-- Expected: Multiple rows (or empty if no orders placed yet)
-- Regular users would only see their own orders (RLS blocks others)

-- ✅ Query 6.3: Admin viewing all products (should work)
SELECT id, title, price, stock, category_id
FROM public.products
ORDER BY created_at DESC;

-- Expected: All 12 products shown
-- Regular users can also see this (products are public)

-- ✅ Query 6.4: Admin can delete categories
SELECT id, name 
FROM public.categories
LIMIT 5;

-- Regular users cannot delete (RLS policy blocks)
-- Admins can perform all operations on categories

-- ⚠️ Testing Notes:
--    → These queries show data admins can see
--    → Regular users will see fewer results (different RLS policies apply)
--    → If you're not logged in as admin, some queries might show 0 rows

-- ═══════════════════════════════════════════════════════════════════
-- FINAL VERIFICATION CHECKLIST
-- ═══════════════════════════════════════════════════════════════════
-- 📍 Run this LAST to get complete system status at a glance
-- ✅ Copy entire query → Paste in Supabase SQL Editor → Click RUN

SELECT 
  (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public') as table_count,
  (SELECT COUNT(*) FROM public.categories) as categories_count,
  (SELECT COUNT(*) FROM public.products) as products_count,
  (SELECT COUNT(*) FROM public.product_variations) as variations_count,
  (SELECT COUNT(*) FROM auth.users WHERE email = 'admin@jtcollections.com') as admin_account_exists,
  (SELECT COALESCE(role, 'NOT_FOUND') FROM public.profiles WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@jtcollections.com' LIMIT 1)) as admin_role,
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') as rls_policies_count;

-- 🟢 SUCCESS CRITERIA - All should match:
-- ├─ table_count: 10 ✅
-- ├─ categories_count: 4 ✅
-- ├─ products_count: 12 ✅
-- ├─ variations_count: 24 or more ✅
-- ├─ admin_account_exists: 1 ✅
-- ├─ admin_role: 'admin' ✅
-- └─ rls_policies_count: 21 ✅

-- ════════════════════════════════════════════════════════════════════
-- 📋 STEP-BY-STEP VERIFICATION CHECKLIST
-- ════════════════════════════════════════════════════════════════════

-- ☐ STEP 1: Run Query 1.1 - Check 10 tables created
--   Expected: cart, categories, order_items, orders, product_images, 
--             product_variations, products, profiles, users, wishlist

-- ☐ STEP 2: Run Query 2.1 & 2.2 - Check seed data
--   Expected: 4 categories, 12 products

-- ☐ STEP 3: Register at http://localhost:5173/register
--   Email: admin@jtcollections.com
--   Password: Admin@123456

-- ☐ STEP 4: Run Query 3.1 - Verify admin account in auth.users
--   Expected: 1 row with your UUID

-- ☐ STEP 5: Run Query 3.2 - Verify profile was auto-created
--   Expected: 1 row with role = 'user'

-- ☐ STEP 6: Run UPDATE to assign admin role
--   UPDATE public.profiles SET role = 'admin' 
--   WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@jtcollections.com');
--   Expected: "1 row updated"

-- ☐ STEP 7: Run Query 4.1 - Verify admin role assigned
--   Expected: role = 'admin' ✅

-- ☐ STEP 8: Login at http://localhost:5173/login
--   Email: admin@jtcollections.com
--   Password: Admin@123456

-- ☐ STEP 9: Test admin dashboard
--   Visit: http://localhost:5173/admin/orders
--   Expected: Admin page loads, shows orders table

-- ☐ STEP 10: Run FINAL VERIFICATION CHECKLIST (above)
--   Expected: All values match SUCCESS CRITERIA

-- ════════════════════════════════════════════════════════════════════
-- ✅ IF ALL CHECKS PASS, YOUR SYSTEM IS FULLY OPERATIONAL!
-- ════════════════════════════════════════════════════════════════════
-- 
-- Next Steps:
-- 1. Test shopping: http://localhost:5173/shop
-- 2. Add items to cart
-- 3. Checkout and place order
-- 4. View order in admin dashboard: http://localhost:5173/admin/orders
-- 5. Manage products: http://localhost:5173/admin/products
--
-- ════════════════════════════════════════════════════════════════════
