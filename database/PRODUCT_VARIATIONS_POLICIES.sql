-- ═══════════════════════════════════════════════════════════════════
-- JT COLLECTIONS - PRODUCT VARIATIONS POLICIES
-- Executes product variation RLS policies for Supabase
-- Copy-paste this entire file into Supabase SQL Editor and click RUN
-- ═══════════════════════════════════════════════════════════════════

-- Enable RLS on product_variations table
ALTER TABLE public.product_variations ENABLE ROW LEVEL SECURITY;

-- POLICY 1: Everyone can view product variations
DROP POLICY IF EXISTS "Product variations viewable by everyone." ON public.product_variations;
CREATE POLICY "Product variations viewable by everyone." ON public.product_variations 
  FOR SELECT USING (true);

-- POLICY 2: Only admins can insert variations
DROP POLICY IF EXISTS "Admin manage variations" ON public.product_variations;
CREATE POLICY "Admin manage variations" ON public.product_variations 
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- POLICY 3: Only admins can update variations
DROP POLICY IF EXISTS "Admin update variations" ON public.product_variations;
CREATE POLICY "Admin update variations" ON public.product_variations 
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- POLICY 4: Only admins can delete variations
DROP POLICY IF EXISTS "Admin delete variations" ON public.product_variations;
CREATE POLICY "Admin delete variations" ON public.product_variations 
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ═══════════════════════════════════════════════════════════════════
-- ✅ VERIFICATION QUERIES
-- ═══════════════════════════════════════════════════════════════════

-- QUICK VERIFICATION (List all policies for product_variations table)
SELECT tablename, policyname FROM pg_policies 
WHERE tablename = 'product_variations';

-- Expected output: 4 rows
-- 1. Product variations viewable by everyone
-- 2. Admin manage variations
-- 3. Admin update variations
-- 4. Admin delete variations

-- DETAILED VERIFICATION (Full policy details)
SELECT 
  tablename,
  policyname,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'product_variations'
ORDER BY policyname;

-- IMPLEMENTATION VERIFICATION (Check RLS is enabled)
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'product_variations' AND schemaname = 'public';

-- Expected: rowsecurity = true (RLS is enabled)
-- ═══════════════════════════════════════════════════════════════════
