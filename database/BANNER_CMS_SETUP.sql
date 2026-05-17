-- =============================================
-- BANNER CMS SETUP
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. BANNERS TABLE
CREATE TABLE IF NOT EXISTS banners (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT NOT NULL,
  subtitle         TEXT,
  description      TEXT,
  desktop_image    TEXT NOT NULL,
  mobile_image     TEXT,
  overlay_enabled  BOOLEAN DEFAULT true,
  overlay_color    TEXT DEFAULT '#7b00ff',
  is_active        BOOLEAN DEFAULT true,
  sort_order       INT DEFAULT 0,
  auto_slide       BOOLEAN DEFAULT true,
  slide_duration   INT DEFAULT 5000,
  start_date       TIMESTAMP,
  end_date         TIMESTAMP,
  created_at       TIMESTAMP DEFAULT NOW(),
  updated_at       TIMESTAMP DEFAULT NOW()
);

-- 2. BANNER BUTTONS TABLE
CREATE TABLE IF NOT EXISTS banner_buttons (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  banner_id        UUID REFERENCES banners(id) ON DELETE CASCADE,
  text             TEXT NOT NULL,
  link             TEXT NOT NULL,
  style_type       TEXT DEFAULT 'primary',
  background_color TEXT,
  text_color       TEXT,
  border_color     TEXT,
  open_new_tab     BOOLEAN DEFAULT false,
  sort_order       INT DEFAULT 0,
  created_at       TIMESTAMP DEFAULT NOW()
);

-- 3. BUTTON STYLES TABLE (reusable styles)
CREATE TABLE IF NOT EXISTS button_styles (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT NOT NULL,
  background       TEXT,
  color            TEXT,
  border_style     TEXT,
  hover_background TEXT,
  hover_color      TEXT,
  border_radius    TEXT DEFAULT '12px',
  shadow_style     TEXT,
  padding          TEXT DEFAULT '14px 30px',
  created_at       TIMESTAMP DEFAULT NOW()
);

-- 4. BANNER ANALYTICS TABLE
CREATE TABLE IF NOT EXISTS banner_analytics (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  banner_id   UUID REFERENCES banners(id) ON DELETE CASCADE,
  button_id   UUID REFERENCES banner_buttons(id) ON DELETE SET NULL,
  event_type  TEXT CHECK (event_type IN ('impression','click')),
  user_agent  TEXT,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- ── Indexes ───────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_banners_active      ON banners(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_banners_schedule    ON banners(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_banner_buttons_bid  ON banner_buttons(banner_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_analytics_bid       ON banner_analytics(banner_id, event_type);

-- ── updated_at trigger ─────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS banners_updated_at ON banners;
CREATE TRIGGER banners_updated_at
  BEFORE UPDATE ON banners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── RLS ───────────────────────────────────────────────
ALTER TABLE banners          ENABLE ROW LEVEL SECURITY;
ALTER TABLE banner_buttons   ENABLE ROW LEVEL SECURITY;
ALTER TABLE banner_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE button_styles    ENABLE ROW LEVEL SECURITY;

-- Public: read active banners only
CREATE POLICY "Public banners visible"
  ON banners FOR SELECT
  USING (
    is_active = true
    AND (start_date IS NULL OR start_date <= NOW())
    AND (end_date   IS NULL OR end_date   >= NOW())
  );

-- Public: read buttons of active banners
CREATE POLICY "Public buttons visible"
  ON banner_buttons FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM banners b
      WHERE b.id = banner_id AND b.is_active = true
    )
  );

-- Public: read button styles
CREATE POLICY "Public styles visible"
  ON button_styles FOR SELECT USING (true);

-- Public: insert analytics only
CREATE POLICY "Public analytics insert"
  ON banner_analytics FOR INSERT WITH CHECK (true);

-- Admin: full access (all tables)
CREATE POLICY "Admin full banners"
  ON banners FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admin full buttons"
  ON banner_buttons FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admin full styles"
  ON button_styles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admin full analytics"
  ON banner_analytics FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- ── Storage Bucket ────────────────────────────────────
-- Run these separately in Supabase Dashboard > Storage
-- or via the API:
--
-- insert into storage.buckets (id, name, public)
-- values ('banner-images', 'banner-images', true);
--
-- CREATE POLICY "Public banner images read"
--   ON storage.objects FOR SELECT USING (bucket_id = 'banner-images');
--
-- CREATE POLICY "Admin banner images write"
--   ON storage.objects FOR INSERT WITH CHECK (
--     bucket_id = 'banner-images'
--     AND EXISTS (
--       SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
--     )
--   );

-- ── Seed: Default button styles ───────────────────────
INSERT INTO button_styles (name, background, color, border_radius, padding) VALUES
  ('Yellow CTA',    '#FBBF24', '#000000', '12px', '14px 32px'),
  ('White CTA',     '#FFFFFF', '#1e1b4b', '12px', '14px 32px'),
  ('Purple CTA',    '#7C3AED', '#FFFFFF', '12px', '14px 32px'),
  ('Cyan CTA',      '#22D3EE', '#0f172a', '12px', '14px 32px'),
  ('Outline White', 'transparent', '#FFFFFF', '12px', '12px 28px')
ON CONFLICT DO NOTHING;
