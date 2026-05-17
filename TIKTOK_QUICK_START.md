# ⚡ Quick Start Checklist - TikTok Events Fix

Complete these steps in order to fix the "1 issue" error on your TikTok events.

---

## 🎯 THE ISSUE
TikTok Events Manager shows "1 issue" on:
- ❌ ViewContent
- ❌ AddToCart
- ❌ InitiateCheckout
- ❌ Purchase

**Root Cause**: Events need to be added/configured in TikTok Events Manager dashboard

---

## ✅ IMMEDIATE ACTION PLAN (30 minutes)

### STEP 1: Access TikTok Events Manager (5 min)
- [ ] Go to https://business.tiktok.com/
- [ ] Click **Assets** in left sidebar
- [ ] Click **Events Manager**
- [ ] Select Pixel: **D7VPDSBC77UEKU3Q3CT0**
- [ ] Click **Events** tab

---

### STEP 2: Configure ViewContent Event (5 min)

**Navigate:**
1. Click **"Manage Events"** button
2. Select **"Add Event"** or find **ViewContent** if pre-defined
3. Click **"Custom"** if asked

**Configure these fields:**

| Field | Setting |
|-------|---------|
| **Event Name** | `ViewContent` |
| **Map currency** | Select `currency` from dropdown |
| **Map value** | Select `value` from dropdown |
| **Map contents[0].content_id** | Select `product_id` |
| **Map contents[0].content_name** | Select `product_name` |
| **Map contents[0].content_type** | Hard-code to `product` |

- [ ] Click **Save**

---

### STEP 3: Configure AddToCart Event (5 min)

**Navigate:**
1. Click **"Add Event"** button
2. Select **"Custom"**

**Configure fields:**

| Field | Setting |
|-------|---------|
| **Event Name** | `AddToCart` |
| **Map currency** | Select `currency` |
| **Map value** | Select `value` |
| **Map contents[0].content_id** | Select `product_id` |
| **Map contents[0].content_name** | Select `product_name` |
| **Map contents[0].content_type** | Hard-code to `product` |

- [ ] Click **Save**

---

### STEP 4: Configure InitiateCheckout Event (5 min)

**Navigate:**
1. Click **"Add Event"** button
2. Select **"Custom"**

**Configure fields:**

| Field | Setting |
|-------|---------|
| **Event Name** | `InitiateCheckout` |
| **Map currency** | Select `currency` |
| **Map value** | Select `value` |
| **Map contents[0].content_id** | Select `product_id` |
| **Map contents[0].content_name** | Select `product_name` |
| **Map contents[0].content_type** | Hard-code to `product` |
| **Map num_items** | Select `num_items` (optional) |

- [ ] Click **Save**

---

### STEP 5: Configure Purchase Event (5 min) ⭐ MOST IMPORTANT

**Navigate:**
1. Click **"Add Event"** button
2. Select **"Custom"**

**Configure fields:**

| Field | Setting |
|-------|---------|
| **Event Name** | `Purchase` |
| **Map currency** | Select `currency` |
| **Map value** | Select `value` |
| **Map contents[*].content_id** | Select item `content_id` (array) |
| **Map contents[*].content_name** | Select item `content_name` (array) |
| **Map contents[*].content_type** | Hard-code to `product` |
| **Map contents[*].quantity** | Select item `quantity` (array) |
| **Map contents[*].price** | Select item `price` (array) |

- [ ] Click **Save**

**⚠️ KEY**: Purchase MUST use array/contents structure with item-level details!

---

## 🧪 TEST (10 minutes)

### Test Method A: Browser Console

1. [ ] Open https://jt-collection-frontend-ahmadkhan32.vercel.app
2. [ ] Press **F12** → **Console** tab
3. [ ] Paste this code:

```javascript
window.ttq?.track('ViewContent', {
  contents: [{content_id: 'TEST-001', content_type: 'product', content_name: 'Test'}],
  value: 100,
  currency: 'PKR'
});
console.log('✅ Test event sent!');
```

4. [ ] Go to TikTok Events Manager → **Test Events** tab
5. [ ] Verify event appears within 30 seconds

---

### Test Method B: Real Actions on Site

1. [ ] Visit https://jt-collection-frontend-ahmadkhan32.vercel.app
2. [ ] Click on any product → fires **ViewContent** ✅
3. [ ] Click bag icon → fires **AddToCart** ✅
4. [ ] Go to cart → Click "Proceed to Checkout" → fires **InitiateCheckout** ✅
5. [ ] Complete order form → fires **Purchase** ✅
6. [ ] Check TikTok Test Events tab for all 4 events

---

### Test Method C: Check Supabase Database

1. [ ] Go to https://app.supabase.com/ → Select your project
2. [ ] Click **SQL Editor**
3. [ ] Paste and run this:

```sql
SELECT COUNT(*) as event_count FROM tiktok_events;
```

4. [ ] Should show events logged to database
5. [ ] If empty, run the setup SQL:

```sql
CREATE TABLE IF NOT EXISTS tiktok_events (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event_name TEXT,
  event_id TEXT,
  product_id TEXT,
  product_name TEXT,
  amount NUMERIC,
  currency TEXT DEFAULT 'PKR',
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE tiktok_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon inserts" ON tiktok_events
  FOR INSERT WITH CHECK (true);
```

---

## ✨ FINAL VERIFICATION

### Check TikTok Status

- [ ] Go to **TikTok Events Manager** → **Events** tab
- [ ] Verify all 4 events show:
  - ✅ Event name (ViewContent, AddToCart, InitiateCheckout, Purchase)
  - ✅ No red ❌ errors
  - ✅ Last event received timestamp (should be recent)

### Expected Result
```
✅ ViewContent       Last received: 2 hours ago
✅ AddToCart         Last received: 1 hour ago
✅ InitiateCheckout  Last received: 30 minutes ago
✅ Purchase          Last received: 15 minutes ago
```

---

## 🚀 SUCCESS INDICATORS

When everything is working:

1. **TikTok Events Manager shows GREEN ✅**
   - No "1 issue" warning
   - All 4 events listed with checkmarks
   - Recent timestamps for last received events

2. **Test Events Tab shows incoming data**
   - New events appear within 10-30 seconds
   - Event names match configuration (ViewContent, AddToCart, etc.)
   - Payload shows all required fields

3. **Supabase shows logged events**
   - Query returns rows from `tiktok_events` table
   - Recent `created_at` timestamps
   - Correct `event_name` values

4. **Browser Console shows no errors**
   - Press F12 → Console tab
   - No red errors about `ttq` or pixel
   - Pixel initializes on page load

---

## ⏱️ TIMELINE

| Time | What Happens |
|------|-------------|
| **Now** | You configure events in TikTok dashboard (15-20 min) |
| **+1 min** | Test events appear in Test Events tab |
| **+1 hour** | Diagnostic warnings clear (auto-refresh) |
| **+24 hours** | Full validation complete |

---

## 🆘 EMERGENCY CHECKLIST

If something isn't working:

### Events not appearing in TikTok Test Events tab
- [ ] Clear browser cache (Ctrl+Shift+Delete)
- [ ] Refresh https://jt-collection-frontend-ahmadkhan32.vercel.app
- [ ] Check DevTools → Console for errors
- [ ] Verify pixel loads: `console.log(window.ttq)` should show object
- [ ] If empty, pixel failed to load—try incognito mode

### Supabase table empty
- [ ] Copy SQL setup script above
- [ ] Paste into Supabase SQL Editor
- [ ] Click **Run**
- [ ] Verify table created: `SELECT * FROM tiktok_events LIMIT 1;`

### Still showing "1 issue" in TikTok
- [ ] Wait 1-2 hours for TikTok to refresh diagnostics
- [ ] Send fresh test events
- [ ] Check field mappings match exactly (case-sensitive)
- [ ] Verify `contents` array includes all required fields

### "contents not mapping correctly"
- [ ] Verify dropdown shows `content_id`, `product_id`, `product_name`, etc.
- [ ] For Purchase, make sure to map **array** fields (contents[*].price, not contents.price)
- [ ] Hard-code `content_type` to exact string `"product"`

---

## 📋 CONFIGURATION REFERENCE

### Required Fields by Event

**ViewContent, AddToCart, InitiateCheckout:**
```
✅ currency (PKR)
✅ value (product price)
✅ contents[0].content_id (product ID)
✅ contents[0].content_type ("product")
✅ contents[0].content_name (product name)
```

**Purchase (Most Detailed):**
```
✅ currency (PKR)
✅ value (order total)
✅ contents[*].content_id (per-item product ID)
✅ contents[*].content_type ("product")
✅ contents[*].content_name (per-item name)
✅ contents[*].quantity (per-item quantity)
✅ contents[*].price (per-item price)
✅ num_items (total items)
```

---

## 📞 SUPPORT RESOURCES

**Files to Review:**
- [Complete Fix Guide](./TIKTOK_EVENTS_FIX_GUIDE.md) - Detailed walkthrough
- [Exact Payloads](./TIKTOK_EVENT_PAYLOADS.md) - Code examples
- [Code Files](./frontend/src/) - Implementation details

**TikTok Documentation:**
- Events Manager: https://business.tiktok.com/
- Custom Events: https://ads.tiktok.com/help/article/event-manager

**GitHub Repo:**
- All code: https://github.com/ahmadkhan32/JTColection
- Latest commit includes all fixes

---

## ✅ COMPLETION CHECKLIST

- [ ] Accessed TikTok Events Manager
- [ ] Configured ViewContent event
- [ ] Configured AddToCart event
- [ ] Configured InitiateCheckout event
- [ ] Configured Purchase event
- [ ] Tested using browser console
- [ ] Verified events in TikTok Test Events tab
- [ ] Ran Supabase SQL setup (if needed)
- [ ] Checked Supabase tiktok_events table
- [ ] Confirmed no errors in browser console
- [ ] Verified green ✅ in TikTok Events Manager
- [ ] Performed real purchase test flow
- [ ] Confirmed all 4 events firing correctly

---

## 🎉 DONE!

Once all steps complete, your TikTok Pixel is fully functional!

**Pixel ID**: D7VPDSBC77UEKU3Q3CT0  
**Status**: ✅ Live & Tracking  
**Events**: ViewContent, AddToCart, InitiateCheckout, Purchase  
**Database**: Supabase logging all events  

Now you can see TikTok conversion tracking, audience building, and campaign optimization! 🚀
