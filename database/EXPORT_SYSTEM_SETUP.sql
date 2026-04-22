-- ============================================================
-- JT Collections – Export System Setup
-- Run this ONCE in Supabase SQL Editor
-- Safe to re-run: uses IF NOT EXISTS / OR REPLACE throughout
-- ============================================================

-- ── 1. Performance indexes for export queries ──────────────
-- Speeds up date-range and status filters on orders table

CREATE INDEX IF NOT EXISTS idx_orders_created_at
  ON public.orders (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_status
  ON public.orders (status);

CREATE INDEX IF NOT EXISTS idx_orders_status_created
  ON public.orders (status, created_at DESC);

-- Speeds up order_items → products join
CREATE INDEX IF NOT EXISTS idx_order_items_order_id
  ON public.order_items (order_id);

CREATE INDEX IF NOT EXISTS idx_order_items_product_id
  ON public.order_items (product_id);

-- Speeds up category → product lookup
CREATE INDEX IF NOT EXISTS idx_products_category_id
  ON public.products (category_id);


-- ── 2. Export-ready view (orders with full detail) ─────────
-- Used as a reference query by the export system.
-- The backend replicates this via Supabase JS client.

CREATE OR REPLACE VIEW public.orders_export_view AS
SELECT
  o.id                          AS order_id,
  SUBSTRING(o.id::text, 1, 8)   AS order_ref,
  o.created_at,
  o.customer_name,
  o.email,
  o.phone,
  o.city,
  o.address,
  o.status,
  o.payment_method,
  o.currency,
  o.total_amount,
  oi.id                          AS item_id,
  oi.quantity,
  oi.price_at_purchase           AS unit_price,
  (oi.price_at_purchase * oi.quantity) AS line_total,
  oi.color,
  oi.size,
  p.title                        AS product_name,
  c.name                         AS category_name
FROM
  public.orders         o
  LEFT JOIN public.order_items   oi ON oi.order_id  = o.id
  LEFT JOIN public.products       p  ON p.id         = oi.product_id
  LEFT JOIN public.categories     c  ON c.id         = p.category_id
ORDER BY
  o.created_at DESC, oi.id;


-- ── 3. RLS – allow admins to read the view ─────────────────
-- If Row-Level Security is enabled on the view, expose it to authenticated users.
-- The backend uses supabaseAdmin (service-role) which bypasses RLS anyway,
-- but this allows ad-hoc queries in the Supabase dashboard.

ALTER VIEW public.orders_export_view OWNER TO postgres;


-- ── 4. Helper function: export orders filtered by category ─
-- This Postgres function is an alternative to in-memory filtering.
-- Call it with: SELECT * FROM get_orders_by_category('Lawn');

CREATE OR REPLACE FUNCTION public.get_orders_by_category(
  p_category TEXT,
  p_status   TEXT    DEFAULT NULL,
  p_from     TIMESTAMPTZ DEFAULT NULL,
  p_to       TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
  order_id       UUID,
  order_ref      TEXT,
  created_at     TIMESTAMPTZ,
  customer_name  TEXT,
  email          TEXT,
  phone          TEXT,
  city           TEXT,
  status         TEXT,
  payment_method TEXT,
  currency       TEXT,
  total_amount   NUMERIC,
  product_name   TEXT,
  category_name  TEXT,
  color          TEXT,
  size           TEXT,
  quantity       INT,
  unit_price     NUMERIC,
  line_total     NUMERIC
)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT
    o.id,
    SUBSTRING(o.id::text, 1, 8),
    o.created_at,
    o.customer_name,
    o.email,
    o.phone,
    o.city,
    o.status,
    o.payment_method,
    o.currency,
    o.total_amount,
    p.title,
    c.name,
    oi.color,
    oi.size,
    oi.quantity,
    oi.price_at_purchase,
    (oi.price_at_purchase * oi.quantity)
  FROM
    public.orders         o
    JOIN  public.order_items   oi ON oi.order_id  = o.id
    JOIN  public.products       p  ON p.id         = oi.product_id
    JOIN  public.categories     c  ON c.id         = p.category_id
  WHERE
    LOWER(c.name) = LOWER(p_category)
    AND (p_status IS NULL OR o.status = p_status)
    AND (p_from   IS NULL OR o.created_at >= p_from)
    AND (p_to     IS NULL OR o.created_at <= p_to)
  ORDER BY o.created_at DESC;
$$;


-- ── 5. Quick verification queries ──────────────────────────
-- Run these to confirm the export system is working:

-- Count orders per status:
-- SELECT status, COUNT(*) FROM public.orders GROUP BY status ORDER BY COUNT(*) DESC;

-- Test the export view:
-- SELECT * FROM public.orders_export_view LIMIT 5;

-- Test the category function:
-- SELECT * FROM public.get_orders_by_category('Lawn') LIMIT 5;

-- Check indexes exist:
-- SELECT indexname, tablename FROM pg_indexes WHERE schemaname = 'public' AND indexname LIKE 'idx_%';
