-- =============================================
-- BANNER CMS V2 — FULL MIGRATION
-- Run this in Supabase SQL Editor
-- =============================================

-- ─────────────────────────────────────────────
-- 1. ALTER BANNERS TABLE (add new columns)
-- ─────────────────────────────────────────────
ALTER TABLE banners
  ADD COLUMN IF NOT EXISTS banner_type        TEXT DEFAULT 'hero',
  ADD COLUMN IF NOT EXISTS background_type    TEXT DEFAULT 'gradient',
  ADD COLUMN IF NOT EXISTS background_color   TEXT,
  ADD COLUMN IF NOT EXISTS gradient_start     TEXT DEFAULT '#3b0764',
  ADD COLUMN IF NOT EXISTS gradient_end       TEXT DEFAULT '#7C3AED',
  ADD COLUMN IF NOT EXISTS text_color         TEXT DEFAULT '#ffffff',
  ADD COLUMN IF NOT EXISTS font_family        TEXT DEFAULT 'Inter',
  ADD COLUMN IF NOT EXISTS title_size         TEXT DEFAULT '64px',
  ADD COLUMN IF NOT EXISTS description_size   TEXT DEFAULT '20px',
  ADD COLUMN IF NOT EXISTS content_position   TEXT DEFAULT 'left',
  ADD COLUMN IF NOT EXISTS animation_type     TEXT DEFAULT 'slide',
  ADD COLUMN IF NOT EXISTS device_type        TEXT DEFAULT 'all',
  ADD COLUMN IF NOT EXISTS country_code       TEXT,
  ADD COLUMN IF NOT EXISTS variant            TEXT DEFAULT 'A';

-- ─────────────────────────────────────────────
-- 2. ALTER BANNER_BUTTONS TABLE (add styling columns)
-- ─────────────────────────────────────────────
ALTER TABLE banner_buttons
  ADD COLUMN IF NOT EXISTS border_radius      TEXT DEFAULT '14px',
  ADD COLUMN IF NOT EXISTS padding            TEXT DEFAULT '16px 30px',
  ADD COLUMN IF NOT EXISTS shadow_style       TEXT,
  ADD COLUMN IF NOT EXISTS hover_background   TEXT,
  ADD COLUMN IF NOT EXISTS hover_color        TEXT,
  ADD COLUMN IF NOT EXISTS icon               TEXT;

-- ─────────────────────────────────────────────
-- 3. BANNER VERSION HISTORY TABLE
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS banner_versions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  banner_id     UUID REFERENCES banners(id) ON DELETE CASCADE,
  previous_data JSONB NOT NULL,
  changed_by    TEXT,
  created_at    TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_versions_banner ON banner_versions(banner_id, created_at DESC);

-- ─────────────────────────────────────────────
-- 4. ALTER ANALYTICS TABLE (add device / country)
-- ─────────────────────────────────────────────
ALTER TABLE banner_analytics
  ADD COLUMN IF NOT EXISTS device  TEXT,
  ADD COLUMN IF NOT EXISTS country TEXT;

-- ─────────────────────────────────────────────
-- 5. RLS for banner_versions
-- ─────────────────────────────────────────────
ALTER TABLE banner_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full versions"
  ON banner_versions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- ─────────────────────────────────────────────
-- 6. AUTO-SAVE VERSION on UPDATE trigger
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION save_banner_version()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO banner_versions (banner_id, previous_data)
  VALUES (OLD.id, row_to_json(OLD)::jsonb);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS banners_version_trigger ON banners;
CREATE TRIGGER banners_version_trigger
  BEFORE UPDATE ON banners
  FOR EACH ROW EXECUTE FUNCTION save_banner_version();

-- ─────────────────────────────────────────────
-- 7. Supabase Storage (run once in dashboard)
-- ─────────────────────────────────────────────
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('banner-images', 'banner-images', true)
-- ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────
-- 8. Default test banner (optional)
-- ─────────────────────────────────────────────
-- INSERT INTO banners (title, subtitle, description, desktop_image, gradient_start, gradient_end, is_active)
-- VALUES (
--   'NEW 2026 COLLECTION',
--   'JT Collections — Premium Fashion',
--   'Shop the latest unstitched & ready-to-wear luxury suits.',
--   'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=2070',
--   '#3b0764', '#7C3AED', true
-- );
