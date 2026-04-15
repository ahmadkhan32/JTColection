-- Test Orders Data for Admin Dashboard Testing
-- Run this in Supabase SQL Editor after running complete_seed.sql

-- Fix: allow guest orders (drops NOT NULL on user_id if it exists)
ALTER TABLE public.orders ALTER COLUMN user_id DROP NOT NULL;

-- Add test orders (no user_id needed - guest orders are allowed)
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

-- Recent orders
('Ahmed Khan', '+923001234567', 'ahmed@example.com', 'House 123, Main Street', 'Lahore', '54000', 250.00, 'pending', 'COD', 'pending', NOW() - INTERVAL '2 days'),
('Fatima Ali', '+923004567890', 'fatima@example.com', 'Apartment 5B, Park Road', 'Karachi', '75500', 395.00, 'processing', 'COD', 'paid', NOW() - INTERVAL '4 days'),
('Hassan Raza', '+923109876543', 'hassan@example.com', 'Office 201, Business Hub', 'Islamabad', '44000', 520.00, 'shipped', 'Card Payment', 'paid', NOW() - INTERVAL '6 days'),
('Sara Khan', '+923155555555', 'sara@example.com', 'Villa 45, Defence Road', 'Lahore', '54792', 180.50, 'delivered', 'Card Payment', 'paid', NOW() - INTERVAL '10 days'),
('Muhammad Ali', '+923201234567', 'malik@example.com', 'Apt 12A, Tower B, Pearl Tower', 'Karachi', '75600', 675.00, 'pending', 'COD', 'pending', NOW() - INTERVAL '1 day'),
('Aisha Malik', '+923335555555', 'aisha@example.com', 'House 7, Garden Street', 'Islamabad', '44050', 420.75, 'processing', 'Card Payment', 'paid', NOW() - INTERVAL '3 days'),
('Hassan Ahmed', '+923456666666', 'hbahmed@example.com', 'Block 5, New Town', 'Faisalabad', '38000', 310.00, 'shipped', 'COD', 'pending', NOW() - INTERVAL '5 days'),
('Zainab Hassan', '+923167777777', 'zainab@example.com', 'Street 123, Model Town', 'Lahore', '54000', 895.50, 'delivered', 'Card Payment', 'paid', NOW() - INTERVAL '12 days'),
('Khalid Ahmed', '+923298888888', 'khalid@example.com', 'Flat 4, Green Centre', 'Karachi', '75270', 545.00, 'pending', 'COD', 'pending', NOW() - INTERVAL '0 days'),
('Mariam Khan', '+923019999999', 'mariam@example.com', 'Res 456, Bahria Town', 'Rawalpindi', '46000', 720.00, 'shipped', 'Card Payment', 'paid', NOW() - INTERVAL '7 days')

ON CONFLICT DO NOTHING;

-- Note: order_items will be auto-populated when orders are created through the API
-- If you need to add order items manually, use the orders table ID and insert like:
/*
INSERT INTO public.order_items (order_id, product_id, quantity, price) VALUES
-- Get the first created order ID from the query above and use it
*/
