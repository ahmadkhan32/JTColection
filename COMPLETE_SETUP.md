# 🚀 JT Collections - Complete Setup Guide

## Overview
This guide walks you through setting up your complete ecommerce system in ~15 minutes.

---

## ✅ Prerequisites
- [ ] Development server running: `npm run dev` (already done ✓)
- [ ] Supabase account created
- [ ] Browser with access to Supabase dashboard
- [ ] Ready to copy-paste SQL commands

---

## 🔧 STEP 1: Database Migrations

**What this does:** Creates all database tables with relationships and Row Level Security policies

1. Go to: **https://supabase.com/dashboard**
2. Select your **JT Collections** project
3. Go to **SQL Editor** (left sidebar)
4. Click **"+ New Query"**
5. Copy the entire content below and paste it:

### Schema SQL (Copy & Paste Everything Below)

```sql
-- ====================================================================
-- JT Collections – Production Supabase Schema (v2)
-- Run this FIRST
-- ====================================================================

-- STEP 1: Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- STEP 2: Create Users Table (Independent from Auth)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT UNIQUE,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 3: Create Profiles (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  phone TEXT,
  address TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add role column if it doesn't exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- STEP 4: Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 5: Products Table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  old_price NUMERIC,
  stock INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  sizes TEXT[] DEFAULT '{}',
  colors TEXT[] DEFAULT '{}',
  fabric TEXT,
  season TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 6: Product Variations (for size/color combinations)
CREATE TABLE IF NOT EXISTS public.product_variations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  color TEXT NOT NULL,
  size TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  price_adjustment NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 7: Cart Table
CREATE TABLE IF NOT EXISTS public.cart (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  selected_size TEXT,
  selected_color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id, selected_size, selected_color)
);

-- STEP 8: Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  total_amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'pending_payment')),
  payment_method TEXT DEFAULT 'COD',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 9: Order Items Table
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  variation_id UUID REFERENCES public.product_variations(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price NUMERIC NOT NULL,
  size TEXT,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 10: Wishlist Table
CREATE TABLE IF NOT EXISTS public.wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- STEP 11: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_cart_user ON public.cart(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_user ON public.wishlist(user_id);

-- STEP 12: Create trigger for new auth users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role)
  VALUES (NEW.id, NEW.email, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- STEP 13: Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- STEP 14: Create RLS Policies for Profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- STEP 15: Create RLS Policies for Products (public read)
CREATE POLICY "Products are viewable by everyone"
  ON public.products FOR SELECT
  USING (true);

-- STEP 16: Create RLS Policies for Cart
CREATE POLICY "Users can view their own cart"
  ON public.cart FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert into their own cart"
  ON public.cart FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart"
  ON public.cart FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete from their own cart"
  ON public.cart FOR DELETE
  USING (auth.uid() = user_id);

-- STEP 17: Create RLS Policies for Orders
CREATE POLICY "Users can view their own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can insert their own orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update all orders"
  ON public.orders FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'admin');

-- STEP 18: Create RLS Policies for Order Items
CREATE POLICY "Users can view order items for their orders"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND (orders.user_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin')
    )
  );

CREATE POLICY "Allow insert for authenticated users"
  ON public.order_items FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- STEP 19: Create RLS Policies for Wishlist
CREATE POLICY "Users can view their own wishlist"
  ON public.wishlist FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own wishlist"
  ON public.wishlist FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete from their own wishlist"
  ON public.wishlist FOR DELETE
  USING (auth.uid() = user_id);

-- STEP 20: Create RLS Policies for Categories
CREATE POLICY "Categories are viewable by everyone"
  ON public.categories FOR SELECT
  USING (true);

-- ✅ Schema migration complete!
```

6. Click the **"RUN"** button (top right)
7. Wait for completion (should show no errors)
8. ✅ **Schema is now created!**

---

## 🎯 STEP 2: Seed Products & Categories

**What this does:** Inserts 4 categories and 12 products with full details

1. Go back to **SQL Editor**
2. Click **"+ New Query"** (create a new one)
3. Copy the entire content from: **supabase/seed/complete_seed.sql**
4. Paste it into the SQL Editor
5. Click **"RUN"**
6. Wait for completion
7. ✅ **Products are now seeded!**

---

## 👤 STEP 3: Create Admin Account

**What this does:** Creates your admin user account

1. Visit: **http://localhost:5173/register**
2. Fill in the form:
   - **Email:** `admin@jtcollections.com`
   - **Password:** `Admin@123456`
   - **Confirm Password:** `Admin@123456`
3. Click **"Sign Up"**
4. ✅ **Account created!**

---

## 👑 STEP 4: Assign Admin Role

**What this does:** Gives your account admin permissions

1. Go back to **Supabase SQL Editor**
2. Click **"+ New Query"** again
3. Copy and paste this SQL:

```sql
-- Update your account to admin role
UPDATE public.profiles 
SET role = 'admin' 
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email = 'admin@jtcollections.com'
);
```

4. Click **"RUN"**
5. You should see "1 row updated"
6. ✅ **You are now an admin!**

---

## 🔍 STEP 5: Verify Everything Works

### Check 1: View Categories in Database
```sql
SELECT id, name, description FROM public.categories ORDER BY name;
-- Should show 4 categories: Women, Men, Accessories, Footwear
```

### Check 2: View Products in Database
```sql
SELECT title, price, stock FROM public.products LIMIT 5;
-- Should show 12 products with prices and stock
```

### Check 3: Access Admin Dashboard
- Visit: **http://localhost:5173/admin/orders**
- You should see the admin panel
- If showing login, refresh the page
- ✅ **Admin dashboard works!**

### Check 4: Test Customer Flow
1. Visit **http://localhost:5173/shop**
2. Browse products and add to cart
3. Go to **Checkout**
4. Fill in details and place order
5. Should redirect to success page with order ID
6. ✅ **Customer flow works!**

### Check 5: View Order in Admin
1. Go to **http://localhost:5173/admin/orders**
2. Should see your test order
3. Try changing status (pending → confirmed → shipped)
4. ✅ **Admin order management works!**

---

## 📊 Setup Checklist

- [ ] Ran Schema SQL in Supabase
- [ ] Ran Seed SQL in Supabase
- [ ] Created admin account at /register
- [ ] Assigned admin role via SQL
- [ ] Verified categories exist in database
- [ ] Verified products exist in database
- [ ] Accessed admin dashboard at /admin/orders
- [ ] Tested customer checkout flow
- [ ] Verified order appears in admin panel
- [ ] Changed order status successfully

---

## 🆘 Troubleshooting

### "Tables already exist" error
- This is OK! The SQL uses `IF NOT EXISTS` so it won't duplicate
- Just continue with the next step

### "Permission denied" error
- Make sure Supabase project is selected correctly
- Verify you're using the right credentials

### "Cannot find admin at /admin/orders"
- Make sure you:
  1. Signed up as admin@jtcollections.com
  2. Ran the role update SQL
  3. Refreshed the page after signing in

### Products not showing in shop
- Make sure seed.sql was executed completely
- Run this query to check: `SELECT COUNT(*) FROM public.products;`
- Should return 12

### Orders not appearing in admin
- Make sure you signed in as admin first
- Try a test order from /shop
- Verify order status is 'pending' (not cancelled)

---

## 📞 Support

Refer to these documentation files:
- **ADMIN_DATABASE_SETUP.md** - Detailed admin setup guide
- **SETUP_GUIDE.md** - Environment and project setup
- **ORDER_IMPLEMENTATION_GUIDE.md** - Architecture details

---

## ⏱️ Time Estimate
- Schema migration: 2-3 minutes
- Seed data: 1 minute  
- Create admin account: 1 minute
- Assign role: 30 seconds
- Verification: 3-5 minutes
- **Total: ~10-15 minutes**

---

## 🎉 You're All Set!

Your complete ecommerce system is now ready to use. Start with:
1. Browse products: http://localhost:5173/shop
2. Admin panel: http://localhost:5173/admin/orders

Enjoy! 🚀
