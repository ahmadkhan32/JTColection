# 🚀 JT COLLECTIONS - COMPLETE SETUP GUIDE
## Register & Login Successfully in 8 Easy Steps

---

## ✅ SYSTEM STATUS

```
✅ Frontend: Running on http://localhost:5174
✅ Backend: Supabase Cloud Connected
⏳ Database: Ready for deployment
```

---

## 📋 MASTER SETUP PROCESS (8 Steps)

### **Step 1️⃣: Deploy Database Schema to Supabase**

**Where:** Supabase Dashboard → SQL Editor

**What to do:**
1. Go to: https://supabase.com/dashboard/project/xmssdsjhinitkykdpatb/sql/new
2. Click **New Query** button
3. Open file: `supabase/migrations/schema.sql`
4. **Select ALL** (Ctrl+A)
5. **Copy** (Ctrl+C)
6. Go back to Supabase SQL Editor
7. **Paste** the entire content (Ctrl+V)
8. Click **RUN** button
9. **Wait for completion** (about 5-10 seconds)

**Expected Result:**
```
✅ Success: No errors
✅ Message: "Query executed successfully"
```

**If you see errors:**
- Check that you ran in the correct Supabase project
- Verify all text was copied (should be ~295 lines)
- Try again 

---

### **Step 2️⃣: Seed Data (Categories & Products)**

**Where:** Supabase Dashboard → SQL Editor

**What to do:**
1. In Supabase, click **New Query** (create a NEW tab)
2. Open file: `supabase/seed/complete_seed.sql`
3. **Select ALL** (Ctrl+A) 
4. **Copy** (Ctrl+C)
5. Paste in new Supabase SQL Editor tab (Ctrl+V)
6. Click **RUN** button
7. **Wait for completion**

**Expected Result:**
```
✅ Success: No errors
✅ Message indicates: Categories inserted, Products inserted
```

---

### **Step 3️⃣: Verify Database Setup (IMPORTANT!)**

**Where:** Supabase Dashboard → SQL Editor

**What to do:**
1. Create **NEW Query** in Supabase
2. Copy and paste this SQL:

```sql
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

3. Click **RUN**

**Expected Result:**
```
10 rows should appear:
✅ cart
✅ categories
✅ order_items
✅ orders
✅ product_images
✅ product_variations
✅ products
✅ profiles
✅ users
✅ wishlist
```

**If you don't see 10 tables:**
- Run Step 1 again
- Check for error messages in Supabase

---

### **Step 4️⃣: Register Admin Account**

**Where:** Your Browser

**What to do:**
1. Open browser to: **http://localhost:5174/register**
2. You should see the Registration Form
3. Fill in the form:
   - **Email:** `admin@jtcollections.com`
   - **Password:** `Admin@123456`
   - **Confirm Password:** `Admin@123456`
   - **Name:** `Admin` (optional, can fill it in)
4. Click **Sign Up** button
5. **Wait** for page to process (3-5 seconds)

**Expected Result:**
```
✅ Page redirects to login OR
✅ Success message appears
✅ No error messages
```

**What happens behind the scenes:**
- ✅ Account created in Supabase auth.users
- ✅ Profile created automatically in public.profiles
- ✅ Role set to 'user' (we'll change to 'admin' next)

---

### **Step 5️⃣: Verify Account Was Created**

**Where:** Supabase Dashboard → SQL Editor

**What to do:**
1. Create **NEW Query** in Supabase
2. Copy and paste:

```sql
SELECT id, email, created_at
FROM auth.users
WHERE email = 'admin@jtcollections.com';
```

3. Click **RUN**

**Expected Result:**
```
✅ 1 row should appear with:
  - id: (your UUID, something like 550e8400-e29b-41d4-a716-446655440000)
  - email: admin@jtcollections.com
  - created_at: (today's date and time)
```

**If no rows appear:**
- Go back to Step 4 and try registering again
- Make sure you used the exact email: `admin@jtcollections.com`

---

### **Step 6️⃣: Assign Admin Role (CRITICAL!)**

**Where:** Supabase Dashboard → SQL Editor

**What to do:**
1. Create **NEW Query** in Supabase (new tab)
2. Copy and paste this EXACTLY:

```sql
UPDATE public.profiles 
SET role = 'admin' 
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email = 'admin@jtcollections.com'
);
```

3. Click **RUN** button
4. **Wait for completion**

**Expected Result:**
```
✅ Success message shows: "1 row updated"
✅ This means admin role was assigned successfully
```

**If you see "0 rows updated":**
- The profile doesn't exist (go back to Step 4/5)
- The email doesn't match (check spelling exactly: `admin@jtcollections.com`)
- Try running Step 5 verification first

---

### **Step 7️⃣: Verify Admin Role Was Assigned**

**Where:** Supabase Dashboard → SQL Editor

**What to do:**
1. Create **NEW Query** in Supabase
2. Copy and paste:

```sql
SELECT 
  u.id,
  u.email,
  p.name,
  p.role,
  p.created_at
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'admin@jtcollections.com';
```

3. Click **RUN**

**Expected Result:**
```
✅ 1 row should appear with:
  - email: admin@jtcollections.com
  - role: admin ✅ (THIS IS WHAT WE NEED!)
  - name: Admin (or whatever you entered)
  - created_at: today's date
```

**If role is still 'user':**
- Run Step 6 again
- Make sure you get "1 row updated" message
- Then run this verification again

---

### **Step 8️⃣: Login to Your Account**

**Where:** Your Browser

**What to do:**
1. Go to **http://localhost:5174/login**
2. You should see the Login Form
3. Enter:
   - **Email:** `admin@jtcollections.com`
   - **Password:** `Admin@123456`
4. Click **Log In** button
5. **Wait** for page to process (2-3 seconds)

**Expected Result:**
```
✅ Page redirects to home or dashboard
✅ You are now logged in!
✅ No error messages
```

**If login fails:**
- Double-check email and password match exactly what you registered
- Make sure Step 7 shows role = 'admin'
- Try logging out and back in

---

## 🎯 VERIFY COMPLETE LOGIN SUCCESS

After successful login, test these features:

### Test 1: Browse Shop
1. Go to: http://localhost:5174/shop
2. **Expected:** See 12 products displayed ✅

### Test 2: Access Admin Dashboard
1. Go to: http://localhost:5174/admin/orders
2. **Expected:** Admin page loads (not access denied) ✅

### Test 3: View All Users (Admin)
1. Go to: http://localhost:5174/admin/users
2. **Expected:** See list of registered users ✅

### Test 4: Manage Products (Admin)
1. Go to: http://localhost:5174/admin/products
2. **Expected:** See all 12 products ✅

---

## 🔐 COMPLETE VERIFICATION CHECKLIST

Run this ONE query in Supabase to verify everything:

```sql
SELECT 
  (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public') as table_count,
  (SELECT COUNT(*) FROM public.categories) as categories_count,
  (SELECT COUNT(*) FROM public.products) as products_count,
  (SELECT COUNT(*) FROM public.product_variations) as variations_count,
  (SELECT COUNT(*) FROM auth.users WHERE email = 'admin@jtcollections.com') as admin_exists,
  (SELECT COALESCE(role, 'NOT_FOUND') FROM public.profiles WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@jtcollections.com' LIMIT 1)) as admin_role,
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') as rls_policies;
```

**✅ Success looks like:**
```
| table_count | categories_count | products_count | admin_exists | admin_role | rls_policies |
|-------------|------------------|----------------|--------------|------------|--------------|
|     10      |        4         |       12       |      1       |   admin    |     21       |
```

---

## 🔗 QUICK LINKS (After Login)

| Page | URL |
|------|-----|
| 🏠 Home | http://localhost:5174 |
| 🛍️ Shop | http://localhost:5174/shop |
| 🛒 Cart | http://localhost:5174/cart |
| ❤️ Wishlist | http://localhost:5174/wishlist |
| 📝 Checkout | http://localhost:5174/checkout |
| 👑 Admin Orders | http://localhost:5174/admin/orders |
| 📦 Admin Products | http://localhost:5174/admin/products |
| 👥 Admin Users | http://localhost:5174/admin/users |
| 📂 Admin Categories | http://localhost:5174/admin/categories |

---

## ❌ TROUBLESHOOTING

| Problem | Solution |
|---------|----------|
| **"Schema doesn't exist" error in Step 1** | Make sure you selected ALL content from schema.sql (~295 lines) |
| **"Duplicate policy" error in Step 1** | Run Step 1 again - it should have DROP POLICY IF EXISTS |
| **No products showing in Step 2** | Verify Step 1 completed first, then run Step 2 |
| **"Admin account not found" in Step 5** | Register again at http://localhost:5174/register |
| **"0 rows updated" in Step 6** | Verify Step 5 shows 1 row with correct email |
| **"Access denied" at /admin pages** | Verify Step 7 shows role = 'admin' |
| **Login keeps failing** | Verify email is exactly: `admin@jtcollections.com` |
| **Blank products page in shop** | Make sure Step 2 (seed data) completed successfully |

---

## 📚 HELPFUL FILES

| File | Purpose |
|------|---------|
| `supabase/migrations/schema.sql` | Database schema (Step 1) |
| `supabase/seed/complete_seed.sql` | Seed data (Step 2) |
| `QUICK_VERIFICATION.sql` | Quick verification queries |
| `VERIFICATION_QUERIES.sql` | Detailed verification guide |
| `ADMIN_ROLE_SETUP.sql` | Admin role help |

---

## ✅ YOU'RE DONE! 🎉

Once you complete all 8 steps and see the success indicators:

**You can now:**
- ✅ Browse the shop (12 products)
- ✅ Add items to cart
- ✅ Login as admin
- ✅ View orders
- ✅ Manage products
- ✅ Manage users
- ✅ Manage categories

**Time required:** ~10-15 minutes

---

## 🆘 NEED HELP?

If you get stuck on any step:
1. Check the "Troubleshooting" section above
2. Verify you're using the correct Supabase project
3. Make sure all SQL queries are copied completely
4. Check that no characters are missing from emails/passwords

**Frontend running:** http://localhost:5174 ✅  
**Backend ready:** Supabase Cloud ✅  
**You're ready to begin!** 🚀

