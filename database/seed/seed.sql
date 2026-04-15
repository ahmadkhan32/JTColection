-- ====================================================================
-- JT Collections – Development Seed Data
-- ====================================================================

-- 1. Seed Categories
INSERT INTO public.categories (name, description, image_url) VALUES
  ('Women', 'Elegant clothing for the modern woman.', 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d'),
  ('Accessories', 'Luxury handbags and designer complements.', 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809')
ON CONFLICT (name) DO NOTHING;

-- 2. Seed Products (Linking to categories)
INSERT INTO public.products (title, price, image_url, category_id, stock, description) VALUES
  ('Luxury Silk Dress', 95.00, 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d', (SELECT id FROM public.categories WHERE name='Women'), 10, 'High-quality luxury silk dress for elegant occasions.'),
  ('Modern Abaya', 80.00, 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03', (SELECT id FROM public.categories WHERE name='Women'), 15, 'Elegant and modern clothing for daily wear.'),
  ('Elegant Party Gown', 150.00, 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956', (SELECT id FROM public.categories WHERE name='Women'), 5, 'Exclusive gown designed for the perfect night out.'),
  ('Premium Leather Handbag', 120.00, 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809', (SELECT id FROM public.categories WHERE name='Accessories'), 8, 'Genuine leather handbag with modern gold accents.')
ON CONFLICT DO NOTHING;
