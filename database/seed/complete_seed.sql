-- ====================================================================
-- JT Collections – Complete Seed Data (Categories, Products, Users, Orders)
-- Run this in Supabase SQL Editor after running schema.sql
-- ====================================================================

-- ═══════════════════════════════════════════════════════════════════
-- 1. SEED CATEGORIES + SUBCATEGORIES
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO public.categories (name, slug, description, image_url) VALUES
   ('Clothing', 'clothing', 'Core women clothing category with stitched and unstitched collections.', 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=500'),
   ('Bottom Wear', 'bottom-wear', 'Bottom wear essentials for modern eastern and fusion outfits.', 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=500'),
   ('Accessories', 'accessories', 'Dupatta, scarves and handbags.', 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=500'),
   ('Special', 'special', 'Fresh edits including new arrivals and sale.', 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=500')
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug;

INSERT INTO public.subcategories (category_id, name, slug) VALUES
   ((SELECT id FROM public.categories WHERE slug='clothing'), 'Unstitched Suits', 'unstitched-suits'),
   ((SELECT id FROM public.categories WHERE slug='clothing'), 'Stitched Suits', 'stitched-suits'),
   ((SELECT id FROM public.categories WHERE slug='clothing'), '2-Piece Suits', '2-piece-suits'),
   ((SELECT id FROM public.categories WHERE slug='clothing'), '3-Piece Suits', '3-piece-suits'),
   ((SELECT id FROM public.categories WHERE slug='clothing'), 'Kurti / Tops', 'kurti-tops'),
   ((SELECT id FROM public.categories WHERE slug='clothing'), 'Maxi Dresses', 'maxi-dresses'),
   ((SELECT id FROM public.categories WHERE slug='clothing'), 'Abaya / Modest Wear', 'abaya-modest-wear'),
   ((SELECT id FROM public.categories WHERE slug='clothing'), 'Western Wear', 'western-wear'),
   ((SELECT id FROM public.categories WHERE slug='bottom-wear'), 'Trousers', 'trousers'),
   ((SELECT id FROM public.categories WHERE slug='bottom-wear'), 'Palazzo', 'palazzo'),
   ((SELECT id FROM public.categories WHERE slug='bottom-wear'), 'Jeans', 'jeans'),
   ((SELECT id FROM public.categories WHERE slug='bottom-wear'), 'Skirts', 'skirts'),
   ((SELECT id FROM public.categories WHERE slug='accessories'), 'Dupatta', 'dupatta'),
   ((SELECT id FROM public.categories WHERE slug='accessories'), 'Scarves', 'scarves'),
   ((SELECT id FROM public.categories WHERE slug='accessories'), 'Handbags', 'handbags'),
   ((SELECT id FROM public.categories WHERE slug='special'), 'New Arrivals', 'new-arrivals'),
   ((SELECT id FROM public.categories WHERE slug='special'), 'Sale', 'sale')
ON CONFLICT (category_id, name) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════
-- 2. SEED PRODUCTS
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO public.products (title, slug, description, category_id, subcategory_id, price, discount_price, old_price, image_url, images, sizes, colors, stock, fabric, work, pieces, includes, care_instructions, is_new_arrival, is_on_sale, season) VALUES
('Embroidered Lawn Shalwar Kameez', 'embroidered-lawn-shalwar-kameez', 'Elegant 3-piece embroidered lawn suit perfect for summer wear.',
 (SELECT id FROM public.categories WHERE slug='clothing'),
 (SELECT id FROM public.subcategories WHERE slug='3-piece-suits'),
 4500, 3999, 4500,
 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800',
 ARRAY['https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800','https://images.unsplash.com/photo-1464863979621-258859e62245?w=800'],
 ARRAY['S','M','L','XL'], ARRAY['Sky Blue'], 25, 'Lawn', 'Embroidery', 3,
 ARRAY['Shirt','Shalwar','Dupatta'], 'Hand wash only. Do not bleach.', true, false, 'Summer'),

('Digital Printed 2-Piece Suit', 'digital-printed-2-piece-suit', 'Modern printed 2-piece outfit for casual day wear.',
 (SELECT id FROM public.categories WHERE slug='clothing'),
 (SELECT id FROM public.subcategories WHERE slug='2-piece-suits'),
 3200, 2899, 3200,
 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800',
 ARRAY['https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800'],
 ARRAY['S','M','L'], ARRAY['Lavender','Peach'], 32, 'Cambric', 'Digital Print', 2,
 ARRAY['Shirt','Trouser'], 'Machine wash cold.', true, false, 'Summer'),

('Straight Fit Trouser', 'straight-fit-trouser', 'Comfortable straight-fit trouser in soft cotton.',
 (SELECT id FROM public.categories WHERE slug='bottom-wear'),
 (SELECT id FROM public.subcategories WHERE slug='trousers'),
 1500, 1299, 1500,
 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800',
 ARRAY['https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800'],
 ARRAY['S','M','L','XL'], ARRAY['Black','Beige'], 40, 'Cotton', 'Plain', 1,
 ARRAY['Trouser'], 'Wash dark colors separately.', false, false, 'All Season'),

('Chiffon Dupatta', 'chiffon-dupatta', 'Lightweight chiffon dupatta with lace border.',
 (SELECT id FROM public.categories WHERE slug='accessories'),
 (SELECT id FROM public.subcategories WHERE slug='dupatta'),
 1800, 1499, 1800,
 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
 ARRAY['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800'],
 ARRAY['Free Size'], ARRAY['Maroon','Off White'], 55, 'Chiffon', 'Lace Work', 1,
 ARRAY['Dupatta'], 'Dry clean recommended.', false, true, 'All Season')

ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════
-- 3. SEED PRODUCT VARIATIONS (Size + Color combinations with stock)
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO public.product_variations (product_id, color, size, stock, price_adjustment)
SELECT p.id, 'Sky Blue', 'S', 8, 0
FROM public.products p WHERE p.slug = 'embroidered-lawn-shalwar-kameez'
ON CONFLICT DO NOTHING;

INSERT INTO public.product_variations (product_id, color, size, stock, price_adjustment)
SELECT p.id, 'Sky Blue', 'M', 10, 0
FROM public.products p WHERE p.slug = 'embroidered-lawn-shalwar-kameez'
ON CONFLICT DO NOTHING;

INSERT INTO public.product_variations (product_id, color, size, stock, price_adjustment)
SELECT p.id, 'Sky Blue', 'L', 7, 200
FROM public.products p WHERE p.slug = 'embroidered-lawn-shalwar-kameez'
ON CONFLICT DO NOTHING;

INSERT INTO public.product_variations (product_id, color, size, stock, price_adjustment)
SELECT p.id, 'Lavender', 'S', 6, 0
FROM public.products p WHERE p.slug = 'digital-printed-2-piece-suit'
ON CONFLICT DO NOTHING;

INSERT INTO public.product_variations (product_id, color, size, stock, price_adjustment)
SELECT p.id, 'Peach', 'M', 9, 0
FROM public.products p WHERE p.slug = 'digital-printed-2-piece-suit'
ON CONFLICT DO NOTHING;

INSERT INTO public.product_variations (product_id, color, size, stock, price_adjustment)
SELECT p.id, 'Black', 'M', 14, 0
FROM public.products p WHERE p.slug = 'straight-fit-trouser'
ON CONFLICT DO NOTHING;



-- ═══════════════════════════════════════════════════════════════════
-- 4. CREATE TEST USERS AND PROFILES
-- ═══════════════════════════════════════════════════════════════════

-- Note: You need to create auth users via Supabase Auth UI or API first
-- Then use their UUIDs here

-- Example: Create profiles for test users
-- Replace the UUIDs with actual auth user IDs from your Supabase project

-- INSERT INTO public.profiles (id, name, phone, address, role)
-- VALUES 
--   ('00000000-0000-0000-0000-000000000001', 'Admin User', '+923001234567', 'House 1, Street A, Lahore', 'admin'),
--   ('00000000-0000-0000-0000-000000000002', 'Test Customer', '+923009999999', 'House 5, Street B, Karachi', 'user')
-- ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════
-- 5. SAMPLE ORDERS (for testing admin dashboard)
-- ═══════════════════════════════════════════════════════════════════

-- Example sample order (uncomment and replace UUIDs with real ones)
-- INSERT INTO public.orders (user_id, customer_name, phone, address, city, total_amount, status, payment_method)
-- VALUES 
--   ('00000000-0000-0000-0000-000000000002', 'Ahmed Khan', '+923001234567', 'House 123, Main Street', 'Lahore', 250.00, 'pending', 'COD'),
--   ('00000000-0000-0000-0000-000000000002', 'Fatima Ali', '+923004567890', 'Apartment 5B, Park Road', 'Karachi', 395.00, 'confirmed', 'COD'),
--   ('00000000-0000-0000-0000-000000000002', 'Hassan Raza', '+923109876543', 'Office 201, Business Hub', 'Islamabad', 520.00, 'shipped', 'COD')
-- ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════
-- 6. INSTRUCTIONS FOR ADMIN SETUP
-- ═══════════════════════════════════════════════════════════════════

/*
To set up admin access:

1. Sign up at http://localhost:5173/register with:
   - Email: admin@jtcollections.com
   - Password: Admin@123456

2. Then run this SQL in Supabase to make them admin:
   
   UPDATE public.profiles 
   SET role = 'admin' 
   WHERE id = (
     SELECT id FROM auth.users 
     WHERE email = 'admin@jtcollections.com'
   );

3. Or manually update with your user UUID:
   
   UPDATE public.profiles 
   SET role = 'admin' 
   WHERE id = 'your-actual-uuid-here';

4. Access admin panel at: http://localhost:5173/admin/orders
*/

-- ═══════════════════════════════════════════════════════════════════
-- End of Seed Data
-- ═══════════════════════════════════════════════════════════════════
