# 🚀 COMPLETE JT COLLECTIONS DATABASE SETUP GUIDE

## ✅ YOUR SYSTEM STATUS

### Frontend Server
```
✓ Status: RUNNING
✓ URL: http://localhost:5173
✓ Port: 5173
✓ Framework: React 19.2.4 + Vite 8.0.7
✓ TypeScript: Enabled
✓ Tailwind CSS: Active
```

### Backend Server (Supabase Cloud)
```
✓ Status: RUNNING (Cloud-Based)
✓ Provider: Supabase.co
✓ Database: PostgreSQL
✓ Real-time: Enabled
✓ Authentication: Ready
✓ Location: Cloud (Always Running)
```

---

## 📋 STEP-BY-STEP DATABASE SETUP

### 🔥 STEP 1: RUN SCHEMA (Create Tables)

**Copy the entire content from:**
```
c:\Users\asadk\Downloads\JT Colection\supabase\migrations\schema.sql
```

**Then in Supabase:**
1. Go to: https://supabase.com/dashboard/project/xmssdsjhinitkykdpatb/sql/new
2. Click `+ New Query`
3. **PASTE** the schema.sql content
4. Click `RUN` button
5. ✅ Wait for: "No errors" message

**What this creates:**
- ✅ 10 Database Tables
- ✅ RLS Policies (20+)
- ✅ Indexes & Constraints
- ✅ Triggers & Functions

---

### 🌱 STEP 2: RUN SEED DATA (Insert Products)

**Copy the entire content from:**
```
c:\Users\asadk\Downloads\JT Colection\supabase\seed\complete_seed.sql
```

**Then in Supabase:**
1. Go to: https://supabase.com/dashboard/project/xmssdsjhinitkykdpatb/sql/new
2. Click `+ New Query`
3. **PASTE** the seed.sql content
4. Click `RUN` button
5. ✅ Wait for: "No errors" message

**What this inserts:**
- ✅ 4 Categories (Women, Men, Accessories, Footwear)
- ✅ 12 Products (Complete catalog)
- ✅ Product Variations (Size + Color combinations)
- ✅ Product Images (Gallery)

---

### 👤 STEP 3: CREATE ADMIN ACCOUNT

**In your browser:**
1. Go to: http://localhost:5173/register
2. Fill in:
   - **Email:** admin@jtcollections.com
   - **Password:** Admin@123456
   - **Confirm:** Admin@123456
3. Click `Sign Up` button
4. ✅ You should see: Account created successfully

**What this does:**
- Creates auth user in Supabase
- Creates profile record
- Sets initial role to 'user'

---

### 🔐 STEP 4: ASSIGN ADMIN ROLE

**SQL to run in Supabase:**

```sql
UPDATE public.profiles 
SET role = 'admin' 
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email = 'admin@jtcollections.com'
);
```

**In Supabase:**
1. Go to: https://supabase.com/dashboard/project/xmssdsjhinitkykdpatb/sql/new
2. Click `+ New Query`
3. **PASTE** the SQL above
4. Click `RUN` button
5. ✅ Expected: "1 row updated" message

**What this does:**
- Upgrades your profile to admin
- Enables admin dashboard access
- Allows product management

---

### 🧪 STEP 5: VERIFY SETUP

**Run these verification queries in Supabase to confirm everything works:**

#### Check 1: Categories Created
```sql
SELECT id, name, description FROM public.categories ORDER BY name;
```
Expected: **4 rows** (Women, Men, Accessories, Footwear)

#### Check 2: Products Seeded
```sql
SELECT title, price, stock FROM public.products LIMIT 12;
```
Expected: **12 rows** with product data

#### Check 3: Product Variations
```sql
SELECT COUNT(*) as variation_count FROM public.product_variations;
```
Expected: **Multiple rows** (size/color combinations)

#### Check 4: Admin Profile
```sql
SELECT 
  u.id, 
  u.email, 
  p.role, 
  p.created_at
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'admin@jtcollections.com';
```
Expected: **1 row with role='admin'**

#### Check 5: RLS Policies
```sql
SELECT tablename, COUNT(*) as policy_count 
FROM pg_policies 
GROUP BY tablename 
ORDER BY tablename;
```
Expected: **Multiple rows** showing policies per table

---

## 🌐 ACCESS YOUR APPLICATION

### Frontend Pages (Now Available)

| Page | URL | Access |
|------|-----|--------|
| **Home** | http://localhost:5173/ | Public |
| **Shop** | http://localhost:5173/shop | Public |
| **Product** | http://localhost:5173/product/[id] | Public |
| **Cart** | http://localhost:5173/cart | Public |
| **Checkout** | http://localhost:5173/checkout | Public |
| **Success** | http://localhost:5173/success | Public |
| **Register** | http://localhost:5173/register | Public |
| **Login** | http://localhost:5173/login | Public |
| **Admin Orders** | http://localhost:5173/admin/orders | Admin Only ⭐ |
| **Admin Products** | http://localhost:5173/admin/products | Admin Only ⭐ |
| **Admin Categories** | http://localhost:5173/admin/categories | Admin Only ⭐ |
| **Admin Users** | http://localhost:5173/admin/users | Admin Only ⭐ |

---

## 🎯 COMPLETE SYSTEM FLOW

```
1. USER VISITS http://localhost:5173
   ↓
2. REACT FRONTEND (Vite Dev Server)
   ├─ Port: 5173
   ├─ Framework: React 19.2.4
   └─ Build Tool: Vite 8.0.7
   ↓
3. API CALLS TO SUPABASE
   ├─ Fetch Products
   ├─ Fetch Categories
   ├─ Create Orders
   └─ Manage Cart
   ↓
4. SUPABASE CLOUD (Backend)
   ├─ PostgreSQL Database
   ├─ RLS Security
   ├─ Real-time API
   └─ Authentication
   ↓
5. DATA RETURNED TO FRONTEND
   ↓
6. REACT RENDERS UI
   ↓
7. USER SEES WEBSITE
```

---

## 📊 DATABASE STRUCTURE

### 10 Tables Created:
1. **users** - Independent user records
2. **profiles** - Linked to auth.users with role
3. **categories** - Product categories
4. **products** - Main product data
5. **product_variations** - Size/color SKU tracking
6. **product_images** - Gallery images
7. **cart** - Shopping cart items
8. **orders** - Customer orders
9. **order_items** - Items in orders
10. **wishlist** - Favorite products

### Security (RLS Policies):
- ✅ Products: Public read, Admin write/delete
- ✅ Orders: Users see own, Admins see all
- ✅ Cart: Users manage own cart
- ✅ Wishlist: Users manage own list
- ✅ Variations: Public read, Admin manage

---

## 🚀 QUICK CHECKLIST

- [x] **Frontend Running** → http://localhost:5173
- [x] **Backend Connected** → Supabase Cloud
- [ ] **Schema Created** → Run schema.sql in Supabase
- [ ] **Data Seeded** → Run complete_seed.sql in Supabase
- [ ] **Admin Created** → Sign up at /register
- [ ] **Admin Role Set** → Run role update SQL
- [ ] **Verified** → Run verification queries
- [ ] **Test Shop** → Visit /shop page
- [ ] **Test Admin** → Access /admin/orders
- [ ] **Test Checkout** → Complete test purchase

---

## ⚡ FILE LOCATIONS

- **Schema:** `supabase/migrations/schema.sql`
- **Seed Data:** `supabase/seed/complete_seed.sql`
- **Frontend:** `client/src/`
- **Services:** `client/src/services/`
- **Pages:** `client/src/pages/`
- **Components:** `client/src/components/`

---

## 🆘 TROUBLESHOOTING

### If schema.sql fails:
- ✅ Check: All `CREATE TABLE IF NOT EXISTS` statements should succeed
- ✅ Check: RLS should be enabled on all tables
- ✅ Try: Drop entire schema first if conflicts (warning: data loss)

### If seed.sql fails:
- ✅ Check: Schema.sql ran successfully first
- ✅ Check: All arrays use `ARRAY['item1','item2']` syntax
- ✅ Check: Categories must exist before products

### If admin doesn't work:
- ✅ Check: Profile exists after signup
- ✅ Check: Role is set to 'admin' (not 'Admin')
- ✅ Try: Re-run the role update SQL

### If products don't show:
- ✅ Check: 12 products were inserted
- ✅ Check: Categories were created
- ✅ Check: RLS allows public SELECT on products

---

## 📞 SUPPORT DOCS

- **00-START-HERE.md** → Project overview
- **EXECUTION_GUIDE.md** → Complete walkthrough
- **COMPLETE_SETUP.md** → Detailed instructions
- **ADMIN_DATABASE_SETUP.md** → Admin configuration
- **SQL_COMMANDS.sql** → Quick SQL reference
- **PRODUCT_VARIATIONS_POLICIES.sql** → RLS policies

---

**🎉 YOUR SYSTEM IS READY!**

**Frontend:** ✅ Running on localhost:5173
**Backend:** ✅ Connected to Supabase Cloud

**Next:** Follow the 5 steps above to complete database setup!
