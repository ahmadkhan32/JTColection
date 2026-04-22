-- ====================================================================
-- JT Collections – Product Color Variant System Migration
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- ====================================================================

-- ──────────────────────────────────────────────────────────────────
-- 1. Add image_url column to product_variations
--    Each color variant can now have its own dedicated image.
-- ──────────────────────────────────────────────────────────────────
ALTER TABLE public.product_variations
  ADD COLUMN IF NOT EXISTS image_url TEXT;

-- ──────────────────────────────────────────────────────────────────
-- 2. Fix cart UNIQUE constraint so the same product in different
--    colors/sizes creates separate cart rows (not a conflict).
--
--    OLD: UNIQUE(user_id, product_id)          ← blocks variant rows
--    NEW: UNIQUE per (user_id, product_id, color, size)
--
--    We use COALESCE so that NULLs are treated as '' for uniqueness.
-- ──────────────────────────────────────────────────────────────────
ALTER TABLE public.cart
  DROP CONSTRAINT IF EXISTS cart_user_id_product_id_key;

DROP INDEX IF EXISTS public.cart_user_product_variant_idx;

CREATE UNIQUE INDEX cart_user_product_variant_idx
  ON public.cart (
    user_id,
    product_id,
    COALESCE(selected_color, ''),
    COALESCE(selected_size, '')
  );

-- ──────────────────────────────────────────────────────────────────
-- 3. Ensure RLS allows public SELECT on product_variations
--    (skip if a policy already exists)
-- ──────────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'product_variations'
      AND policyname = 'Public read product_variations'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Public read product_variations"
        ON public.product_variations
        FOR SELECT
        USING (true);
    $policy$;
  END IF;
END$$;

-- ──────────────────────────────────────────────────────────────────
-- 4. Verification queries (uncomment to check)
-- ──────────────────────────────────────────────────────────────────
-- SELECT column_name, data_type
--   FROM information_schema.columns
--  WHERE table_name = 'product_variations';

-- SELECT indexname, indexdef
--   FROM pg_indexes
--  WHERE tablename = 'cart'
--    AND indexname = 'cart_user_product_variant_idx';
