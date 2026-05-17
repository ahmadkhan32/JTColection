# 🔍 TikTok Events - Verification & Troubleshooting Guide

Complete verification that your TikTok events are properly configured and firing.

---

## ✅ STEP 1: Verify Pixel is Loaded

**What to do:**
1. Open your site: https://jt-collection-frontend-ahmadkhan32.vercel.app
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Paste this code:

```javascript
console.log('🔍 Checking TikTok Pixel...');
console.log('ttq object exists:', !!window.ttq);
console.log('track function exists:', typeof window.ttq?.track === 'function');
console.log('Pixel ready to fire:', !!window.ttq?.track);
```

**Expected Result:**
```
🔍 Checking TikTok Pixel...
ttq object exists: true
track function exists: function
Pixel ready to fire: true
```

**If you see `false` or undefined:**
- ❌ Pixel script failed to load
- 🔧 Fix: Clear cache (Ctrl+Shift+Delete), refresh page, try incognito mode

---

## ✅ STEP 2: Verify Environment Variables

**What to do:**
1. Still in Console, paste:

```javascript
console.log('📋 Environment Check:');
console.log('Pixel ID configured:', import.meta.env.VITE_TIKTOK_PIXEL_ID);
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Missing');
console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');
```

**Expected Result:**
```
📋 Environment Check:
Pixel ID configured: D7VPDSBC77UEKU3Q3CT0
Supabase URL: ✅ Set
Supabase Key: ✅ Set
```

**If you see `undefined` or ❌:**
- 🔧 Fix: Check `frontend/.env` file has correct values

---

## ✅ STEP 3: Test Individual Events

### Test ViewContent Event

**Console Code:**
```javascript
console.log('📸 Firing ViewContent event...');
window.ttq?.track('ViewContent', {
  event_id: 'test-view-' + Date.now(),
  currency: 'PKR',
  value: 2500,
  contents: [{
    content_id: 'PROD-TEST-001',
    content_type: 'product',
    content_name: 'Test Product'
  }]
});
console.log('✅ ViewContent event fired');
```

**Verification:**
1. Run code above in console
2. Go to **TikTok Events Manager** → **Test Events** tab
3. Within 10-30 seconds, you should see event appear

---

### Test AddToCart Event

**Console Code:**
```javascript
console.log('🛒 Firing AddToCart event...');
window.ttq?.track('AddToCart', {
  event_id: 'test-cart-' + Date.now(),
  currency: 'PKR',
  value: 1500,
  contents: [{
    content_id: 'PROD-CART-001',
    content_type: 'product',
    content_name: 'Cart Test Item'
  }]
});
console.log('✅ AddToCart event fired');
```

---

### Test InitiateCheckout Event

**Console Code:**
```javascript
console.log('💳 Firing InitiateCheckout event...');
window.ttq?.track('InitiateCheckout', {
  event_id: 'test-checkout-' + Date.now(),
  currency: 'PKR',
  value: 5000,
  num_items: 2,
  contents: [{
    content_id: 'PROD-001|PROD-002',
    content_type: 'product',
    content_name: 'Multiple items'
  }]
});
console.log('✅ InitiateCheckout event fired');
```

---

### Test Purchase Event (Most Important!)

**Console Code:**
```javascript
console.log('💰 Firing Purchase event with item-level details...');
window.ttq?.track('Purchase', {
  event_id: 'test-purchase-' + Date.now(),
  currency: 'PKR',
  value: 5000,
  num_items: 2,
  contents: [
    {
      content_id: 'PROD-001',
      content_type: 'product',
      content_name: 'Item 1',
      quantity: 1,
      price: 2500
    },
    {
      content_id: 'PROD-002',
      content_type: 'product',
      content_name: 'Item 2',
      quantity: 1,
      price: 2500
    }
  ]
});
console.log('✅ Purchase event fired');
```

**⚠️ Key Difference:** Purchase uses **array of items** with quantity and price per item, not aggregated!

---

## ✅ STEP 4: Monitor Events in TikTok

**What to do:**
1. Go to **TikTok Business Center**: https://business.tiktok.com/
2. Navigate: **Assets** → **Events Manager**
3. Select Pixel: **D7VPDSBC77UEKU3Q3CT0**
4. Click **Test Events** tab

**What to expect:**
- After running console code, events appear within 10-30 seconds
- Event list shows:
  - Event name (ViewContent, AddToCart, etc.)
  - Timestamp (recent)
  - Payload preview
  - Status: ✅ No errors

**If no events appear after 1 minute:**
- [ ] Refresh Test Events tab
- [ ] Try running test code again
- [ ] Check browser console for JavaScript errors (F12 → Console)
- [ ] Verify pixel loads: `console.log(!!window.ttq)`

---

## ✅ STEP 5: Check Events Configuration

**What to do:**
1. In **TikTok Events Manager**, click **Events** tab (not Test Events)
2. Look for your 4 events:
   - ViewContent
   - AddToCart
   - InitiateCheckout
   - Purchase

**What to expect:**
- All 4 events are listed
- Each shows: **Event Name** and **Status**
- Status is: ✅ (green checkmark or "Active")
- No ⚠️ warning icons
- No ❌ error icons

**Current Status (What you're fixing):**
```
⚠️ ViewContent       1 issue
⚠️ AddToCart         1 issue
⚠️ InitiateCheckout  1 issue
⚠️ Purchase          1 issue
```

**Expected After Configuration:**
```
✅ ViewContent       Active
✅ AddToCart         Active
✅ InitiateCheckout  Active
✅ Purchase          Active
```

---

## ✅ STEP 6: Verify Event Field Mappings

**What to do:**
1. In **Events** tab, click on **ViewContent** event
2. Check **Field Mappings** section
3. Verify these mappings exist:

| Field | Mapped To | Value |
|-------|-----------|-------|
| currency | currency | PKR |
| value | value | Product price |
| contents[0].content_id | product_id | Product ID |
| contents[0].content_type | Hard-coded | "product" |
| contents[0].content_name | product_name | Product name |

**Repeat for:**
- [ ] AddToCart event
- [ ] InitiateCheckout event
- [ ] Purchase event (with additional item fields)

---

## ✅ STEP 7: Check Supabase Logging

**What to do:**
1. Go to **Supabase Dashboard**: https://app.supabase.com/
2. Select your project: **jt-collection**
3. Click **SQL Editor**
4. Run this query:

```sql
-- Check if table exists
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_name = 'tiktok_events'
) AS table_exists;

-- Count events
SELECT COUNT(*) as total_events FROM tiktok_events;

-- View latest 5 events
SELECT event_name, product_id, product_name, value, currency, created_at 
FROM tiktok_events 
ORDER BY created_at DESC 
LIMIT 5;
```

**Expected Result:**
```
table_exists: true

total_events: 5 (or higher if you've sent test events)

Latest events:
ViewContent    | prod-123 | Blue Shirt | 2500 | PKR | 2 hours ago
AddToCart      | prod-123 | Blue Shirt | 2500 | PKR | 1 hour ago
InitiateCheckout | prod-123,prod-456 | Blue Shirt, Red Pants | 5000 | PKR | 30 min ago
Purchase       | order-001 | Order 001 | 5000 | PKR | 15 min ago
```

**If table doesn't exist:**
- Run this SQL:

```sql
CREATE TABLE IF NOT EXISTS tiktok_events (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event_name TEXT NOT NULL,
  event_id TEXT,
  product_id TEXT,
  product_name TEXT,
  amount NUMERIC,
  currency TEXT DEFAULT 'PKR',
  search_string TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE tiktok_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon inserts" ON tiktok_events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated reads" ON tiktok_events
  FOR SELECT USING (auth.role() = 'authenticated');
```

---

## ✅ STEP 8: Real-World Test Flow

**Complete purchase flow to verify everything works end-to-end:**

1. [ ] Clear browser cache (Ctrl+Shift+Delete)
2. [ ] Visit https://jt-collection-frontend-ahmadkhan32.vercel.app
   - 🎯 Fires: **Page** event (auto)
   - ✅ Check console: No errors
   
3. [ ] Search for a product (e.g., "blue")
   - 🎯 Fires: **Search** event
   - ✅ Check TikTok Test Events: Search appears
   
4. [ ] Click on any product
   - 🎯 Fires: **ViewContent** event
   - ✅ Check TikTok Test Events: ViewContent appears
   
5. [ ] Click heart icon (wishlist)
   - 🎯 Fires: **AddToWishlist** event
   
6. [ ] Click bag icon (add to cart)
   - 🎯 Fires: **AddToCart** event
   - ✅ Check Supabase: New row in tiktok_events table
   
7. [ ] Add 2-3 more products
   - 🎯 Fires: **AddToCart** (multiple times)
   
8. [ ] Go to cart
   - ✅ Verify cart shows all items
   
9. [ ] Click "Proceed to Checkout"
   - 🎯 Fires: **InitiateCheckout** event
   - ✅ Check TikTok Test Events: Appears within 30 sec
   
10. [ ] Fill checkout form and place order
    - 🎯 Fires: **PlaceAnOrder** event
    - 🎯 Fires: **Purchase** event (with item-by-item breakdown)
    - ✅ Order success page shows
    - ✅ Check Supabase: Two new rows (PlaceAnOrder + Purchase)
    
11. [ ] Verify in TikTok
    - Go to **Test Events** tab
    - All 4 critical events visible: ✅ ViewContent, ✅ AddToCart, ✅ InitiateCheckout, ✅ Purchase

---

## 🐛 Troubleshooting Problems

### Problem: "TikTok pixel is not loading"

**Symptoms:**
- Console shows: `undefined` for `window.ttq`
- No events in TikTok Test Events tab

**Fixes (try in order):**
1. Clear cache: Ctrl+Shift+Delete
2. Hard refresh: Ctrl+F5
3. Try incognito mode: Ctrl+Shift+N
4. Check pixel ID in `frontend/.env`: Should be `D7VPDSBC77UEKU3Q3CT0`
5. Verify no browser extensions blocking scripts (try with extensions disabled)

---

### Problem: "Events appear in console but not in TikTok Test Events"

**Symptoms:**
- Console shows: `✅ ViewContent event fired`
- TikTok Test Events tab empty or not updating

**Fixes:**
1. Wait 30-60 seconds (there's a delay)
2. Refresh TikTok Test Events tab manually
3. Check pixel ID matches exactly: `D7VPDSBC77UEKU3Q3CT0`
4. Verify payload has all required fields:
   ```javascript
   {
     currency: 'PKR',           // ✅ Required
     value: 100,                // ✅ Required  
     contents: [{               // ✅ Required (array)
       content_id: 'prod-123',  // ✅ Required
       content_type: 'product', // ✅ Required
       content_name: 'Name'     // ✅ Required
     }]
   }
   ```

---

### Problem: "Purchase event shows error in TikTok"

**Symptoms:**
- Purchase event in Test Events has ❌ red error
- TikTok message: "Missing required fields"

**Fixes:**
1. Verify Purchase uses **array** of items:
   ```javascript
   contents: [
     { content_id: '1', content_type: 'product', content_name: 'Item1', quantity: 1, price: 100 },
     { content_id: '2', content_type: 'product', content_name: 'Item2', quantity: 1, price: 100 }
   ]
   ```
   ✅ Not just one item!

2. Ensure each item has: `content_id`, `content_type`, `content_name`, `quantity`, `price`
3. Verify `value` matches sum of (quantity × price) for all items

---

### Problem: "Supabase tiktok_events table is empty"

**Symptoms:**
- Query returns 0 rows
- No events logged to database

**Fixes:**
1. Check table exists: `SELECT * FROM tiktok_events LIMIT 1;`
2. If error "table doesn't exist", run setup SQL (see STEP 7)
3. If table exists but empty:
   - Check browser console: Any errors during event firing?
   - Verify Supabase credentials in `.env`: Correct URL and key?
   - Try firing a test event: `console.log(await fetch('https://your-supabase.com/rest/v1/tiktok_events', ...))`

---

### Problem: "Diagnostics still showing '1 issue' after configuring events"

**Symptoms:**
- TikTok Events Manager shows ⚠️ on all 4 events
- You've followed all steps above

**Fixes:**
1. **Wait 1-2 hours** - TikTok auto-refreshes diagnostics (normal behavior)
2. Send fresh events through production site (don't rely on console tests)
3. Verify field mappings are saved (click event, check Field Mappings tab)
4. Check that:
   - Event name matches exactly (case-sensitive): `ViewContent` not `viewcontent`
   - All required fields are mapped
   - No typos in field names

**Timeline:**
- Fresh events sent → TikTok receives → Diagnostics refresh (1-2 hours) → ✅ Shows green

---

## 📊 FINAL VERIFICATION MATRIX

| Aspect | Check | Status | Fix |
|--------|-------|--------|-----|
| **Pixel Loading** | `window.ttq` exists | ✅ / ❌ | Clear cache + refresh |
| **Event Firing** | Test events in console | ✅ / ❌ | Verify pixel ID in .env |
| **TikTok Receipt** | Events in Test Events tab | ✅ / ❌ | Wait 30 sec, refresh tab |
| **Event Config** | Events in Events tab | ✅ / ❌ | Follow Steps 2-5 setup |
| **Field Mapping** | All fields mapped | ✅ / ❌ | Verify each mapping |
| **Supabase Logging** | Rows in tiktok_events | ✅ / ❌ | Run setup SQL |
| **Real Flow** | Full purchase logs events | ✅ / ❌ | Test complete flow |
| **Diagnostics** | Green ✅ in Events tab | ✅ / ❌ | Wait 2 hours for refresh |

---

## ✅ SUCCESS CHECKLIST

- [ ] Pixel loads: `window.ttq` is an object
- [ ] Test events appear in TikTok within 30 seconds
- [ ] All 4 events configured in TikTok Events Manager
- [ ] All field mappings set correctly
- [ ] Supabase table created with recent event rows
- [ ] Real purchase flow triggers all events
- [ ] TikTok Test Events shows all 4 critical events
- [ ] No red ❌ errors in TikTok
- [ ] Diagnostics show green ✅ (may take 1-2 hours)

---

## 🎉 YOU'RE ALL SET!

When all checks pass:

✅ TikTok Pixel is fully connected  
✅ All 4 events firing correctly  
✅ Events logged to Supabase  
✅ TikTok can track conversions  
✅ Campaigns can optimize on real data  

Your e-commerce site is now tracking customer actions with TikTok! 🚀
