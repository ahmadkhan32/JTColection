-- ============================================================
-- JT Collections: Fix orders table + seed test data
-- Run this entire file in Supabase SQL Editor in one go
-- ============================================================

-- Step 1: Allow guest/anonymous orders (drop NOT NULL on user_id)
ALTER TABLE public.orders ALTER COLUMN user_id DROP NOT NULL;

-- Step 2: Add missing columns if they don't exist yet
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS postal_code text DEFAULT '';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method text DEFAULT 'COD';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending';

-- Step 3: Insert test orders (no user_id needed)
INSERT INTO public.orders (
  customer_name,
  phone,
  email,
  address,
  city,
  postal_code,
  total_amount,
  status,
  payment_method,
  payment_status,
  created_at
) VALUES
('Ahmed Khan',    '+923001234567', 'ahmed@example.com',  'House 123, Main Street',           'Lahore',     '54000', 250.00, 'pending',    'COD',          'pending', NOW() - INTERVAL '2 days'),
('Fatima Ali',    '+923004567890', 'fatima@example.com', 'Apartment 5B, Park Road',          'Karachi',    '75500', 395.00, 'processing', 'COD',          'paid',    NOW() - INTERVAL '4 days'),
('Hassan Raza',   '+923109876543', 'hassan@example.com', 'Office 201, Business Hub',         'Islamabad',  '44000', 520.00, 'shipped',    'Card Payment', 'paid',    NOW() - INTERVAL '6 days'),
('Sara Khan',     '+923155555555', 'sara@example.com',   'Villa 45, Defence Road',           'Lahore',     '54792', 180.50, 'delivered',  'Card Payment', 'paid',    NOW() - INTERVAL '10 days'),
('Muhammad Ali',  '+923201234567', 'malik@example.com',  'Apt 12A, Tower B, Pearl Tower',    'Karachi',    '75600', 675.00, 'pending',    'COD',          'pending', NOW() - INTERVAL '1 day'),
('Aisha Malik',   '+923335555555', 'aisha@example.com',  'House 7, Garden Street',           'Islamabad',  '44050', 420.75, 'processing', 'Card Payment', 'paid',    NOW() - INTERVAL '3 days'),
('Hassan Ahmed',  '+923456666666', 'hbahmed@example.com','Block 5, New Town',               'Faisalabad', '38000', 310.00, 'shipped',    'COD',          'pending', NOW() - INTERVAL '5 days'),
('Zainab Hassan', '+923167777777', 'zainab@example.com', 'Street 123, Model Town',          'Lahore',     '54000', 895.50, 'delivered',  'Card Payment', 'paid',    NOW() - INTERVAL '12 days'),
('Khalid Ahmed',  '+923298888888', 'khalid@example.com', 'Flat 4, Green Centre',            'Karachi',    '75270', 545.00, 'pending',    'COD',          'pending', NOW() - INTERVAL '0 days'),
('Mariam Khan',   '+923019999999', 'mariam@example.com', 'Res 456, Bahria Town',            'Rawalpindi', '46000', 720.00, 'shipped',    'Card Payment', 'paid',    NOW() - INTERVAL '7 days');

-- Done: 10 test orders inserted
SELECT id, customer_name, total_amount, status, created_at FROM public.orders ORDER BY created_at DESC;
