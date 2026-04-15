# Adding Test Orders Data

## Steps to Add Test Orders to Your Database:

1. **Open Supabase Console**
   - Go to your Supabase project: https://app.supabase.com
   - Navigate to the SQL Editor

2. **Copy and Paste the SQL**
   - Copy the contents of [test_orders.sql](test_orders.sql)
   - Paste into the Supabase SQL Editor
   - Click "Run" to execute

3. **Verify the Data**
   - Go back to the Data Editor
   - Check the "orders" table
   - You should see 10 new test orders with different statuses:
     - pending (3 orders)
     - processing (2 orders)
     - shipped (3 orders)
     - delivered (2 orders)

4. **Test in Admin Panel**
   - Navigate to http://localhost:5174/admin/orders
   - The orders should now display with their details

## Test Data Includes:

- **Customer Information**: Names, emails, phone numbers
- **Delivery Details**: Addresses in different cities (Lahore, Karachi, Islamabad, etc.)
- **Order Status**: Mix of pending, processing, shipped, and delivered
- **Payment Details**: COD and Card Payment methods
- **Timestamps**: Orders created at different times (1 to 12 days ago)

## Note:

If you want to add more complex order data with order_items (products in each order), you'll need to:
1. First insert the orders (as done above)
2. Then use the order IDs to insert order_items manually or through the API
