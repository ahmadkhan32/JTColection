# TikTok Events Builder - Fix Missing Vertical Funnel Events

## 🎯 THE EXACT ISSUE (From TikTok)

```
❌ Missing critical vertical funnel events limits campaign optimization
   Affected event types:
   • View content
   • Add to cart
   • Initiate checkout
   • Purchase
   
   Fix: Add the missing events to your pixel through custom coding.
        Using Events Builder to set up missing events without changing your codes.
```

---

## ✅ THE FIX (Exact Steps for Events Builder)

**Goal:** Add 4 events to TikTok Events Manager **without changing your code** (code is already perfect)

### Step 1: Open TikTok Events Manager

1. Go to: **https://business.tiktok.com/**
2. Click **Assets** (left sidebar)
3. Click **Events Manager**
4. Select your pixel: **D7VPDSBC77UEKU3Q3CT0**
5. Click **Events** tab (not "Test Events")

**You should see:**
```
📊 Events Manager
Pixel: D7VPDSBC77UEKU3Q3CT0

❌ ViewContent       ⚠️ Not set up
❌ AddToCart         ⚠️ Not set up
❌ InitiateCheckout  ⚠️ Not set up
❌ Purchase          ⚠️ Not set up
```

---

## 🔧 Add Event 1: ViewContent

### Step 1.1: Click "Add Event" or "Setup Event"
- Look for button labeled: **"+ Add Event"** or **"Setup"**
- Click it

### Step 1.2: Choose Event Type
- Select: **"Custom"** (not a pre-defined event)
- Or select **"ViewContent"** if it's in the list

### Step 1.3: Configure Field Mappings

**Event Details Section:**
```
Event Name: ViewContent
Description: Customer viewed a product
Event ID: [Auto-generated] ← Leave as is
```

**Field Mappings Section:**
Look for these data fields and map them:

| TikTok Field | Maps To | Where It Comes From |
|------|---------|----------|
| `currency` | Select: **currency** | Product page (PKR) |
| `value` | Select: **value** | Product price |
| `contents[0].content_id` | Select: **product_id** | Product ID |
| `contents[0].content_type` | Type: **"product"** (hard-code) | System (fixed value) |
| `contents[0].content_name` | Select: **product_name** | Product title |

**Visual Example:**
```
TikTok Field Mapping:
┌─────────────────────────────────────────────────────┐
│ Event Name:          [ViewContent]                  │
│ Currency:            [Dropdown ↓] Select "currency"│
│ Value:               [Dropdown ↓] Select "value"   │
│ Contents ID:         [Dropdown ↓] Select "id"      │
│ Contents Name:       [Dropdown ↓] Select "name"    │
│ Contents Type:       [Text Field] Enter "product"  │
└─────────────────────────────────────────────────────┘
```

### Step 1.4: Save
- Click **Save** or **Done**
- Should see: ✅ ViewContent added

---

## 🔧 Add Event 2: AddToCart

### Step 2.1: Click "Add Event" again
- Same as Step 1.1

### Step 2.2: Choose Event Type
- Select: **"Custom"** or **"AddToCart"**

### Step 2.3: Configure Field Mappings

**Event Details:**
```
Event Name: AddToCart
Description: Customer added product to shopping cart
```

**Field Mappings:**
| TikTok Field | Maps To |
|------|---------|
| `currency` | Select: **currency** |
| `value` | Select: **value** |
| `contents[0].content_id` | Select: **product_id** |
| `contents[0].content_type` | Type: **"product"** |
| `contents[0].content_name` | Select: **product_name** |

### Step 2.4: Save
- Click **Save**
- Should see: ✅ AddToCart added

---

## 🔧 Add Event 3: InitiateCheckout

### Step 3.1: Click "Add Event" again

### Step 3.2: Choose Event Type
- Select: **"Custom"** or **"InitiateCheckout"**

### Step 3.3: Configure Field Mappings

**Event Details:**
```
Event Name: InitiateCheckout
Description: Customer proceeded to checkout
```

**Field Mappings:**
| TikTok Field | Maps To |
|------|---------|
| `currency` | Select: **currency** |
| `value` | Select: **value** |
| `contents[0].content_id` | Select: **product_id** |
| `contents[0].content_type` | Type: **"product"** |
| `contents[0].content_name` | Select: **product_name** |
| `num_items` | Select: **num_items** (optional) |

### Step 3.4: Save
- Click **Save**
- Should see: ✅ InitiateCheckout added

---

## 🔧 Add Event 4: Purchase ⭐ MOST IMPORTANT

### Step 4.1: Click "Add Event" again

### Step 4.2: Choose Event Type
- Select: **"Custom"** or **"Purchase"** or **"PlaceAnOrder"**

### Step 4.3: Configure Field Mappings

**Event Details:**
```
Event Name: Purchase
Description: Customer completed purchase
```

**Field Mappings - KEY DIFFERENCE FOR PURCHASE:**

| TikTok Field | Maps To | Type |
|------|---------|------|
| `currency` | Select: **currency** | Single value |
| `value` | Select: **value** | Single value |
| `contents[*].content_id` | Select: **content_id** | **ARRAY** |
| `contents[*].content_type` | Type: **"product"** | **ARRAY** |
| `contents[*].content_name` | Select: **content_name** | **ARRAY** |
| `contents[*].quantity` | Select: **quantity** | **ARRAY** |
| `contents[*].price` | Select: **price** | **ARRAY** |
| `num_items` | Select: **num_items** | Single value |

**⚠️ CRITICAL:** For Purchase, use **ARRAY** fields (note the `[*]` notation):
- This means TikTok will receive each item separately (not concatenated)
- Example: 2 items → 2 separate content entries with individual quantity/price
- NOT: One entry with comma-separated values

### Step 4.4: Save
- Click **Save**
- Should see: ✅ Purchase added

---

## ✅ Verification: All Events Added

After completing Steps 1-4, your Events tab should show:

```
📊 Events Manager - All Events Configured

✅ ViewContent       Last received: 30 min ago
✅ AddToCart         Last received: 15 min ago
✅ InitiateCheckout  Last received: 5 min ago
✅ Purchase          Last received: Just now
```

All should have **GREEN ✅** checkmarks (not yellow ⚠️)

---

## 🧪 Test the Configuration

### Test Method: Real Actions on Site

1. **Visit your site**: https://jt-collection-frontend-ahmadkhan32.vercel.app

2. **Perform these actions** (in order):
   - ✅ Click a product → Fires **ViewContent**
   - ✅ Click bag icon → Fires **AddToCart**
   - ✅ Go to cart, click "Proceed to Checkout" → Fires **InitiateCheckout**
   - ✅ Fill form, submit → Fires **Purchase**

3. **Check TikTok Test Events tab**:
   - Go back to **Events Manager** → **Test Events** tab
   - Should see all 4 events within 30-60 seconds
   - Each should have timestamp and payload preview
   - No red ❌ errors

---

## 🔍 Expected Results

### ✅ In TikTok Events Tab
```
Events:
✅ ViewContent       (green, active, timestamp recent)
✅ AddToCart         (green, active, timestamp recent)
✅ InitiateCheckout  (green, active, timestamp recent)
✅ Purchase          (green, active, timestamp recent)

Issue Status: RESOLVED ✅
(was: ⚠️ Missing critical vertical funnel events)
(now: ✅ All critical events properly set up)
```

### ✅ In Test Events Tab
```
Recent Events:
[Purchase]      May 10, 2026 2:30 PM    Value: 5000 PKR
[InitiateCheckout] May 10, 2026 2:28 PM    Value: 5000 PKR
[AddToCart]     May 10, 2026 2:20 PM    Value: 2500 PKR
[ViewContent]   May 10, 2026 2:15 PM    Value: 2500 PKR
```

---

## 📋 Troubleshooting Events Builder

### Problem: "Can't find 'Add Event' button"
**Solution:**
- In Events tab, look for: **"Manage Events"** button
- Or look for event row with **"+Add"** button
- Click that instead

### Problem: "Field dropdown doesn't show the fields I need"
**Solution:**
1. Make sure you're on the **correct pixel** (D7VPDSBC77UEKU3Q3CT0)
2. Check that fields exist on your site's events
3. Refresh the page
4. Try creating event again

### Problem: "Still showing yellow ⚠️ after adding events"
**Solution:**
1. Verify all required fields are mapped
2. For Purchase: Make sure to use **ARRAY** fields (contents[*])
3. Check that hard-coded values are correct (content_type = "product")
4. Save and wait 10-15 minutes for TikTok to process
5. Send fresh test events by visiting your site

### Problem: "Events appear in Test Events but show red ❌ error"
**Solution:**
- Check field mappings have all required values
- Verify Purchase includes item-level details (quantity, price, etc.)
- Ensure contents array is not empty

---

## 🚀 After Configuration

Once all 4 events are added and showing green ✅:

1. **Automatic:** TikTok will re-scan your pixel data (1-2 hours)
2. **Expected:** "Missing critical vertical funnel events" warning disappears
3. **Result:** You can now see conversion tracking + optimize campaigns

---

## 📊 What Your Pixel Can Now Do

With all 4 events properly configured:

✅ **ViewContent** → Track when users browse products  
✅ **AddToCart** → Track when users add items to cart  
✅ **InitiateCheckout** → Track checkout page visits  
✅ **Purchase** → Track completed orders + revenue  

This enables TikTok to:
- 🎯 Optimize ad delivery to high-value audiences
- 📊 Track full funnel conversion (view → cart → checkout → purchase)
- 💰 Calculate accurate CPA (Cost Per Acquisition)
- 📈 Build lookalike audiences from your converters
- 🔄 Create retargeting campaigns for cart abandoners

---

## ⏱️ ESTIMATED TIME

| Step | Time |
|------|------|
| Add ViewContent | 3 min |
| Add AddToCart | 3 min |
| Add InitiateCheckout | 3 min |
| Add Purchase | 5 min |
| **Total Setup** | **~15 minutes** |
| Test on site | 10 min |
| Verify in TikTok | 5 min |
| **Total Time** | **~30 minutes** |
| TikTok auto-refresh | 1-2 hours (automatic) |

---

## ✅ COMPLETION CHECKLIST

- [ ] Accessed TikTok Events Manager
- [ ] Added ViewContent event with field mappings
- [ ] Added AddToCart event with field mappings
- [ ] Added InitiateCheckout event with field mappings
- [ ] Added Purchase event with item-level array fields
- [ ] All 4 events show green ✅ in Events tab
- [ ] Tested on production site (viewed → cart → checkout → purchase)
- [ ] Verified all 4 events in Test Events tab
- [ ] No red ❌ errors in any event
- [ ] "Missing critical vertical funnel events" warning is gone
- [ ] Campaign optimization now available

---

## 🎉 SUCCESS!

Once complete, your TikTok pixel will have:
- ✅ All 4 critical funnel events configured
- ✅ Full conversion tracking enabled
- ✅ Campaign optimization available
- ✅ Accurate ROAS measurement
- ✅ Audience building capabilities

**Your code didn't need changes** — it was already firing the right events! You just needed to tell TikTok dashboard to recognize them through Events Builder.

Now TikTok can optimize your campaigns! 🚀
