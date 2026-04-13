-- ════════════════════════════════════════════════════════════════════
-- 👑 JT COLLECTIONS - ADMIN ROLE SETUP
-- Run this in Supabase SQL Editor to assign admin privileges
-- ════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════
-- ADMIN ROLE ASSIGNMENT (Run after creating admin account)
-- ═══════════════════════════════════════════════════════════════════

UPDATE public.profiles 
SET role = 'admin' 
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email = 'admin@jtcollections.com'
);

-- Expected Result: "1 row updated" ✅

-- ═══════════════════════════════════════════════════════════════════
-- VERIFICATION: Check Admin Was Created Successfully
-- ═══════════════════════════════════════════════════════════════════

SELECT 
  u.id, 
  u.email, 
  p.name,
  p.role, 
  p.created_at
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'admin@jtcollections.com';

-- Expected: 1 row with:
-- - email: admin@jtcollections.com
-- - role: admin ✅

-- ═══════════════════════════════════════════════════════════════════
-- ADDITIONAL: Grant Super Admin (if needed)
-- ═══════════════════════════════════════════════════════════════════

-- Uncomment below if you need super-admin with all permissions:

-- UPDATE public.profiles 
-- SET role = 'super_admin' 
-- WHERE email = 'admin@jtcollections.com';

-- ═══════════════════════════════════════════════════════════════════
-- TROUBLESHOOTING
-- ═══════════════════════════════════════════════════════════════════

-- If admin wasn't created, check:
-- 1. Did you run: http://localhost:5173/register?
-- 2. Did you use: admin@jtcollections.com?
-- 3. Did you confirm password correctly?

-- To find your actual admin UUID (if email is different):
-- SELECT id, email FROM auth.users WHERE email LIKE '%admin%';

-- Then update with correct UUID:
-- UPDATE public.profiles SET role = 'admin' WHERE id = 'your-uuid-here';

-- ═══════════════════════════════════════════════════════════════════
-- VERIFY ALL ADMIN USERS
-- ═══════════════════════════════════════════════════════════════════

SELECT 
  u.id,
  u.email,
  p.name,
  p.phone,
  p.address,
  p.role,
  p.created_at
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE p.role IN ('admin', 'super_admin')
ORDER BY p.created_at DESC;

-- ═══════════════════════════════════════════════════════════════════
