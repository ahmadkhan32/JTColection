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
--   3. Copy the content from: supabase/migrations/schema.sql
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
