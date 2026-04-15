# 🛠️ Admin & Database Setup Guide

## Step 1: Run Database Migrations

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Create a new query
3. Copy **entire content** from `database/schemaa.sql`
4. Paste and execute ✅

---

## Step 2: Seed Sample Data (Categories, Products)

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Create a **new query**
3. Copy **entire content** from `supabase/seed/complete_seed.sql`
4. Execute ✅

This will create:
- ✅ 4 Categories (Women, Men, Accessories, Footwear)
- ✅ 12 Products with stock and images
- ✅ Product variations with size/color options

---

## Step 3: Create Admin Account

### Option A: Automatic (Recommended)

1. **Sign up** at `http://localhost:5173/register` with:
   ```
   Email: admin@jtcollections.com
   Password: Admin@123456
   ```

2. Go to **Supabase Dashboard** → **SQL Editor**
3. Run this SQL:
   ```sql
   UPDATE public.profiles 
   SET role = 'admin' 
   WHERE id = (
     SELECT id FROM auth.users 
     WHERE email = 'admin@jtcollections.com'
   );
   ```

### Option B: Manual (If you know the UUID)

If you have your user's UUID, run:
```sql
UPDATE public.profiles 
SET role = 'admin' 
WHERE id = 'your-actual-uuid-here';
```

To find your UUID:
1. Go to **Supabase** → **Authentication** → **Users**
2. Copy the UUID of your user
3. Replace `your-actual-uuid-here` in the SQL above

---

## Step 4: Verify Setup

### Check if Admin Role is Set
1. Go to **Supabase** → **SQL Editor**
2. Run:
   ```sql
   SELECT id, name, role FROM public.profiles LIMIT 10;
   ```
3. You should see your user with `role = 'admin'` ✅

### Check Products Loaded
1. Run:
   ```sql
   SELECT title, price, stock FROM public.products LIMIT 5;
   ```
2. Should show 12 products ✅

---

## Step 5: Test the System

### 🏪 Customer Flow
1. Go to `http://localhost:5173/`
2. Navigate to `/shop` or `/products`
3. Browse products (you'll see all 12 with stock)
4. Click "Add to Cart"
5. Go to `/checkout`
6. Fill shipping details
7. Click "Confirm COD Order" ✅
8. See order confirmation page

### 👨‍💼 Admin Flow
1. Logout current user
2. **Login** as `admin@jtcollections.com`
3. Go to `http://localhost:5173/admin`
4. Navigate to **Orders**
5. You'll see test orders
6. Click expand (▼) to view items
7. Change status: pending → confirmed → shipped → delivered ✅

---

## Troubleshooting

### "Admin panel shows no orders"
- Check: Did you login as admin user?
  ```sql
  SELECT role FROM public.profiles 
  WHERE id = (SELECT auth.uid());
  ```

### "Products not showing in /shop"
- Check: Run migration and seed scripts
  ```sql
  SELECT COUNT(*) FROM public.products;
  ```

### "Can't update order status"
- Check: Is your user role = 'admin'?
  ```sql
  SELECT id, role FROM public.profiles WHERE email = 'admin@jtcollections.com';
  ```

### "Orders table is empty"
- Test by creating new order via checkout
- Or manually insert sample order (see complete_seed.sql)

---

## SQL Queries for Quick Testing

### View All Products
```sql
SELECT id, title, price, stock, category_id 
FROM public.products ORDER BY created_at DESC;
```

### View All Orders
```sql
SELECT id, customer_name, total_amount, status, created_at 
FROM public.orders ORDER BY created_at DESC;
```

### View Order Items
```sql
SELECT oi.*, p.title, p.image_url
FROM public.order_items oi
LEFT JOIN public.products p ON oi.product_id = p.id
ORDER BY oi.created_at DESC;
```

### Make User Admin
```sql
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

### Check User Role
```sql
SELECT id, name, email, role 
FROM public.profiles 
WHERE name ILIKE '%admin%' OR role = 'admin';
```

### Reset Stock (if needed)
```sql
UPDATE public.products 
SET stock = 50 
WHERE title ILIKE '%dress%' OR title ILIKE '%shirt%';
```

---

## Environment Variables

Create `.env.local` in `frontend/` folder:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

Get these from **Supabase** → **Settings** → **API**

---

## Files Reference

| File | Purpose |
|------|---------|
| `database/schemaa.sql` | Database tables, RLS policies, triggers |
| `supabase/seed/complete_seed.sql` | Categories, products, sample data |
| `frontend/.env.local` | Supabase credentials |

---

## Next Steps

After setup:
1. ✅ Test full order flow (add to cart → checkout → order)
2. ✅ Test admin dashboard (manage orders)
3. ✅ Check stock updates after order
4. ✅ Test different payment methods (COD, Online)
5. ✅ Try order status updates

---

**Need Help?** Check browser console (F12) for errors. Read `ORDER_IMPLEMENTATION_GUIDE.md` for full details.
