-- ====================================================================
-- JT Collections – Complete Seed Data (Categories, Products, Users, Orders)
-- Run this in Supabase SQL Editor after running schema.sql
-- ====================================================================

-- ═══════════════════════════════════════════════════════════════════
-- 1. SEED CATEGORIES
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO public.categories (name, description, image_url) VALUES
  ('Women', 'Elegant clothing for the modern woman.', 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=500'),
  ('Men', 'Premium menswear collection.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500'),
  ('Accessories', 'Luxury handbags and designer complements.', 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=500'),
  ('Footwear', 'Comfortable and stylish shoes for every occasion.', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500')
ON CONFLICT (name) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════
-- 2. SEED PRODUCTS
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO public.products (title, price, old_price, image_url, category_id, stock, description, sizes, colors, fabric, season) VALUES

-- Women's Products
('Premium Silk Dress', 95.00, 120.00, 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500', (SELECT id FROM public.categories WHERE name='Women'), 25, 'High-quality luxury silk dress for elegant occasions.', ARRAY['XS', 'S', 'M', 'L', 'XL'], ARRAY['Black', 'Navy', 'Cream'], 'Silk', 'Summer'),
('Modern Abaya', 80.00, 100.00, 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=500', (SELECT id FROM public.categories WHERE name='Women'), 30, 'Elegant and modern clothing for daily wear.', ARRAY['One Size', 'Plus'], ARRAY['Black', 'Charcoal'], 'Cotton Blend', 'All Season'),
('Elegant Party Gown', 150.00, 200.00, 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=500', (SELECT id FROM public.categories WHERE name='Women'), 12, 'Exclusive gown designed for the perfect night out.', ARRAY['S', 'M', 'L', 'XL'], ARRAY['Red', 'Gold', 'Emerald'], 'Polyester', 'Winter'),
('Casual T-Shirt', 25.00, 35.00, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500', (SELECT id FROM public.categories WHERE name='Women'), 50, 'Comfortable cotton t-shirt for everyday wear.', ARRAY['XS', 'S', 'M', 'L', 'XL', 'XXL'], ARRAY['White', 'Black', 'Gray', 'Navy'], 'Cotton', 'Summer'),
('Denim Jeans', 60.00, 80.00, 'https://images.unsplash.com/photo-1542272604-787c62d465d1?w=500', (SELECT id FROM public.categories WHERE name='Women'), 40, 'Premium denim jeans with perfect fit.', ARRAY['XS', 'S', 'M', 'L', 'XL'], ARRAY['Light Blue', 'Dark Blue', 'Black'], 'Denim', 'All Season'),

-- Men's Products
('Men Cotton Shirt', 50.00, 70.00, 'https://images.unsplash.com/photo-1596362051768-e60b8fba9308?w=500', (SELECT id FROM public.categories WHERE name='Men'), 35, 'Classic cotton shirt for professional look.', ARRAY['S', 'M', 'L', 'XL', 'XXL'], ARRAY['White', 'Light Blue', 'Navy'], 'Cotton', 'All Season'),
('Formal Blazer', 120.00, 160.00, 'https://images.unsplash.com/photo-1591047990635-58e6b1396a4b?w=500', (SELECT id FROM public.categories WHERE name='Men'), 15, 'Premium formal blazer for business occasions.', ARRAY['S', 'M', 'L', 'XL'], ARRAY['Black', 'Navy', 'Gray'], 'Wool Blend', 'Winter'),

-- Accessories
('Premium Leather Handbag', 120.00, 160.00, 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500', (SELECT id FROM public.categories WHERE name='Accessories'), 18, 'Genuine leather handbag with modern design.', ARRAY['One Size'], ARRAY['Black', 'Brown', 'Tan'], 'Leather', 'All Season'),
('Designer Sunglasses', 85.00, 120.00, 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500', (SELECT id FROM public.categories WHERE name='Accessories'), 45, 'Trendy designer sunglasses with UV protection.', ARRAY['One Size'], ARRAY['Black', 'Gold', 'Rose Gold'], 'Plastic & Metal', 'Summer'),
('Silk Scarf', 35.00, 50.00, 'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=500', (SELECT id FROM public.categories WHERE name='Accessories'), 60, 'Luxurious silk scarf perfect for any occasion.', ARRAY['One Size'], ARRAY['Blue', 'Pink', 'Purple', 'Multicolor'], 'Silk', 'All Season'),

-- Footwear
('Leather Loafers', 95.00, 130.00, 'https://images.unsplash.com/photo-1608256543803-ba4f8c70ae0b?w=500', (SELECT id FROM public.categories WHERE name='Footwear'), 28, 'Comfortable leather loafers for professional wear.', ARRAY['6', '7', '8', '9', '10', '11'], ARRAY['Black', 'Brown', 'Tan'], 'Leather', 'All Season'),
('Casual Sneakers', 65.00, 90.00, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', (SELECT id FROM public.categories WHERE name='Footwear'), 35, 'Stylish and comfortable sneakers for daily wear.', ARRAY['5', '6', '7', '8', '9', '10', '11'], ARRAY['White', 'Black', 'Gray', 'Navy'], 'Canvas & Rubber', 'Summer'),
('High Heels', 110.00, 150.00, 'https://images.unsplash.com/photo-1543163521-3bf539c5dd9b?w=500', (SELECT id FROM public.categories WHERE name='Footwear'), 22, 'Elegant high heels for special occasions.', ARRAY['5', '6', '7', '8', '9', '10'], ARRAY['Black', 'Red', 'Gold', 'Silver'], 'Satin & Leather', 'Winter')

ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════
-- 3. SEED PRODUCT VARIATIONS (Size + Color combinations with stock)
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO public.product_variations (product_id, color, size, stock, price_adjustment)
SELECT p.id, 'Black', 'S', 5, 0
FROM public.products p WHERE p.title = 'Premium Silk Dress'
ON CONFLICT DO NOTHING;

INSERT INTO public.product_variations (product_id, color, size, stock, price_adjustment)
SELECT p.id, 'Navy', 'M', 8, 0
FROM public.products p WHERE p.title = 'Premium Silk Dress'
ON CONFLICT DO NOTHING;

INSERT INTO public.product_variations (product_id, color, size, stock, price_adjustment)
SELECT p.id, 'Cream', 'L', 6, 0
FROM public.products p WHERE p.title = 'Premium Silk Dress'
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
