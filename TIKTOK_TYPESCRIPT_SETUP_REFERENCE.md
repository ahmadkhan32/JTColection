# TikTok Pixel Integration - Complete TypeScript Setup Guide

This guide shows the exact code structure for integrating TikTok Pixel with TypeScript + React + Supabase.

---

## 📦 Installation

```bash
npm install @supabase/supabase-js react-router-dom
```

---

## 🗂️ Project Structure

```
src/
├── lib/
│   ├── supabase.ts           # Supabase client
│   ├── tiktok.ts             # TikTok pixel loader
│   ├── eventBuilder.ts       # Event sending logic
│   └── hash.ts               # SHA-256 hashing
│
├── pages/
│   ├── ProductPage.tsx       # ViewContent + AddToCart
│   ├── CartPage.tsx          # InitiateCheckout
│   ├── CheckoutPage.tsx      # PlaceAnOrder + Purchase
│   └── SuccessPage.tsx       # Purchase confirmation
│
├── App.tsx
├── main.tsx
└── vite-env.d.ts
```

**Your Project Location:** `c:\Users\asadk\Downloads\JT Colection\frontend\src\`

---

## 📋 Step 1: Environment Variables

### File: `frontend/.env`

```env
VITE_SUPABASE_URL=https://xmssdsjhinitkykdpatb.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_TIKTOK_PIXEL_ID=D7VPDSBC77UEKU3Q3CT0
```

**Status in Your Project:** ✅ Already configured

---

## 🔗 Step 2: Supabase Connection

### File: `frontend/src/lib/supabase.ts`

```typescript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);
```

**Status in Your Project:** ✅ Already exists (you have this file)

---

## 🗄️ Step 3: Create Database Tables

### Supabase SQL Console

```sql
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT,
  phone TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- TikTok Events table
CREATE TABLE IF NOT EXISTS tiktok_events (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  
  event_name TEXT NOT NULL,
  
  product_id TEXT,
  product_name TEXT,
  content_type TEXT,
  
  value NUMERIC,
  currency TEXT DEFAULT 'PKR',
  
  search_string TEXT,
  
  user_email TEXT,
  user_phone TEXT,
  external_id TEXT,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE tiktok_events ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts
CREATE POLICY "Allow Insert"
ON tiktok_events
FOR INSERT
TO anon
WITH CHECK (true);

-- Allow anonymous reads
CREATE POLICY "Allow Select"
ON tiktok_events
FOR SELECT
TO anon
USING (true);
```

**Status in Your Project:** ✅ Already set up (TIKTOK_EVENTS_SETUP.sql executed)

---

## 🔐 Step 4: SHA-256 Hash Helper

### File: `frontend/src/lib/hash.ts`

```typescript
/**
 * Hash text using SHA-256 (for PII hashing)
 */
export async function sha256(
  text: string
): Promise<string> {
  const data = new TextEncoder().encode(text);
  
  const hashBuffer = await crypto.subtle.digest(
    "SHA-256",
    data
  );
  
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
```

**Status in Your Project:** ✅ Already implemented in `tiktokPixel.ts`

---

## 📱 Step 5: TikTok Pixel Loader

### File: `frontend/src/lib/tiktok.ts`

```typescript
declare global {
  interface Window {
    ttq: any;
  }
}

const PIXEL_ID = import.meta.env.VITE_TIKTOK_PIXEL_ID;

/**
 * Initialize TikTok Pixel
 * This loads the TikTok analytics script
 */
export const initTikTokPixel = () => {
  if (window.ttq) return; // Already loaded
  
  !(function (w: any, d: any, t: any) {
    w.TiktokAnalyticsObject = t;
    
    const ttq = (w[t] = w[t] || []);
    
    ttq.methods = [
      "page",
      "track",
      "identify",
      "instances",
      "debug",
      "on",
      "off",
      "once",
      "ready",
      "alias",
      "group",
      "enableCookie",
      "disableCookie",
      "holdConsent",
      "revokeConsent",
      "grantConsent",
    ];
    
    ttq.setAndDefer = function (t: any, e: any) {
      t[e] = function () {
        t.push(
          [e].concat(Array.prototype.slice.call(arguments, 0))
        );
      };
    };
    
    for (let i = 0; i < ttq.methods.length; i++) {
      ttq.setAndDefer(ttq, ttq.methods[i]);
    }
    
    ttq.load = function (e: any, n: any) {
      const r = "https://analytics.tiktok.com/i18n/pixel/events.js";
      
      ttq._i = ttq._i || {};
      ttq._i[e] = [];
      ttq._t = ttq._t || {};
      ttq._t[e] = +new Date();
      ttq._o = ttq._o || {};
      ttq._o[e] = n || {};
      
      const script = d.createElement("script");
      script.async = true;
      script.src = r + "?sdkid=" + e + "&lib=" + t;
      
      const firstScript = d.getElementsByTagName("script")[0];
      firstScript.parentNode.insertBefore(script, firstScript);
    };
    
    ttq.load(PIXEL_ID);
    ttq.page(); // Fire initial page view
  })(window, document, "ttq");
};
```

**Status in Your Project:** ✅ Already implemented in `tiktokPixel.ts` (more advanced version)

---

## 🎯 Step 6: Event Builder

### File: `frontend/src/lib/eventBuilder.ts`

```typescript
import { supabase } from "./supabase";
import { sha256 } from "./hash";

interface EventPayload {
  event: string;
  
  productId?: string;
  productName?: string;
  contentType?: string;
  
  value?: number;
  currency?: string;
  
  searchString?: string;
  
  email?: string;
  phone?: string;
  externalId?: string;
}

/**
 * Send TikTok event to pixel and save to Supabase
 */
export async function sendTikTokEvent(
  payload: EventPayload
) {
  if (!window.ttq) {
    console.warn("[TikTok] Pixel not loaded");
    return;
  }
  
  let hashedEmail = "";
  let hashedPhone = "";
  let hashedExternalId = "";
  
  // Hash PII
  if (payload.email) {
    hashedEmail = await sha256(payload.email);
  }
  if (payload.phone) {
    hashedPhone = await sha256(payload.phone);
  }
  if (payload.externalId) {
    hashedExternalId = await sha256(payload.externalId);
  }
  
  // 1. Identify user
  window.ttq.identify({
    email: hashedEmail,
    phone_number: hashedPhone,
    external_id: hashedExternalId,
  });
  
  // 2. Fire TikTok event
  window.ttq.track(payload.event, {
    contents: [
      {
        content_id: payload.productId || "",
        content_type: payload.contentType || "product",
        content_name: payload.productName || "",
      },
    ],
    value: payload.value || 0,
    currency: payload.currency || "USD",
    search_string: payload.searchString || "",
  });
  
  // 3. Save to Supabase for audit
  const { error } = await supabase
    .from("tiktok_events")
    .insert([
      {
        event_name: payload.event,
        product_id: payload.productId,
        product_name: payload.productName,
        content_type: payload.contentType,
        value: payload.value,
        currency: payload.currency,
        search_string: payload.searchString,
        user_email: hashedEmail,
        user_phone: hashedPhone,
        external_id: hashedExternalId,
      },
    ]);
  
  if (error) {
    console.error("[TikTok] Supabase insert error:", error);
  }
}
```

**Status in Your Project:** ✅ Already implemented as `logTikTokEvent()` in `tiktokEventLogger.ts` (more advanced)

---

## 🚀 Step 7: Initialize Pixel

### File: `frontend/src/main.tsx`

```typescript
import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import { initTikTokPixel } from "./lib/tiktok";

// Initialize TikTok Pixel on app load
initTikTokPixel();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**Status in Your Project:** ✅ Already done in your `main.tsx`

---

## 📄 Step 8: Product Page

### File: `frontend/src/pages/ProductPage.tsx`

```typescript
import { useEffect } from "react";
import { sendTikTokEvent } from "../lib/eventBuilder";

const product = {
  id: "1077218",
  name: "Premium Shirt",
  price: 100,
};

export default function ProductPage() {
  // Fire ViewContent on page load
  useEffect(() => {
    sendTikTokEvent({
      event: "ViewContent",
      productId: product.id,
      productName: product.name,
      value: product.price,
      currency: "USD",
    });
  }, []);
  
  // Handle add to cart
  const addToCart = async () => {
    await sendTikTokEvent({
      event: "AddToCart",
      productId: product.id,
      productName: product.name,
      value: product.price,
      currency: "USD",
      email: "user@gmail.com",
      phone: "+923001234567",
      externalId: "USER_101",
    });
  };
  
  return (
    <div>
      <h1>{product.name}</h1>
      <button onClick={addToCart}>Add To Cart</button>
    </div>
  );
}
```

**Status in Your Project:** ✅ Implemented in your actual ProductPage.tsx

---

## 🛒 Step 9: Checkout Page

### File: `frontend/src/pages/CheckoutPage.tsx`

```typescript
import { sendTikTokEvent } from "../lib/eventBuilder";

export default function CheckoutPage() {
  const checkout = async () => {
    await sendTikTokEvent({
      event: "InitiateCheckout",
      productId: "1077218",
      productName: "Premium Shirt",
      value: 100,
      currency: "USD",
      email: "user@gmail.com",
      phone: "+923001234567",
      externalId: "USER_101",
    });
  };
  
  return (
    <button onClick={checkout}>
      Checkout
    </button>
  );
}
```

**Status in Your Project:** ✅ Implemented in your actual CartPage.tsx (InitiateCheckout)

---

## ✅ Step 10: Purchase/Success Page

### File: `frontend/src/pages/SuccessPage.tsx`

```typescript
import { useEffect } from "react";
import { sendTikTokEvent } from "../lib/eventBuilder";

export default function SuccessPage() {
  useEffect(() => {
    sendTikTokEvent({
      event: "Purchase",
      productId: "1077218",
      productName: "Premium Shirt",
      value: 100,
      currency: "USD",
      email: "user@gmail.com",
      phone: "+923001234567",
      externalId: "USER_101",
    });
  }, []);
  
  return <h1>Payment Success</h1>;
}
```

**Status in Your Project:** ✅ Implemented in your actual CheckoutPage.tsx (Purchase event)

---

## 🔍 Step 11: More Event Examples

### Search Event
```typescript
await sendTikTokEvent({
  event: "Search",
  searchString: "nike shoes",
  value: 0,
  currency: "USD",
});
```

### Complete Registration
```typescript
await sendTikTokEvent({
  event: "CompleteRegistration",
  email: "user@gmail.com",
  phone: "+923001234567",
  externalId: "USER_101",
});
```

### Add to Wishlist
```typescript
await sendTikTokEvent({
  event: "AddToWishlist",
  productId: "prod-123",
  productName: "Product Name",
  value: 100,
  currency: "USD",
});
```

### Add Payment Info
```typescript
await sendTikTokEvent({
  event: "AddPaymentInfo",
  value: 150,
  currency: "USD",
  email: "user@gmail.com",
});
```

---

## 📊 Step 12: All Supported Events

```typescript
// Standard e-commerce events
"ViewContent"           // Product page view
"AddToCart"            // Item added to cart
"AddToWishlist"        // Item added to wishlist
"Search"               // Product search
"AddPaymentInfo"       // Payment method added
"InitiateCheckout"     // Checkout started
"PlaceAnOrder"         // Order placed
"Purchase"             // Purchase completed
"CompleteRegistration" // Account created
```

---

## 💾 Step 13: Query Events from Database

```typescript
import { supabase } from "./lib/supabase";

// Get all events
const { data, error } = await supabase
  .from("tiktok_events")
  .select("*")
  .order("created_at", {
    ascending: false,
  });

if (error) {
  console.error("Error:", error);
} else {
  console.log("Events:", data);
}

// Get Purchase events only
const { data: purchases } = await supabase
  .from("tiktok_events")
  .select("*")
  .eq("event_name", "Purchase");

// Get events from last 24 hours
const { data: recent } = await supabase
  .from("tiktok_events")
  .select("*")
  .gt("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
```

---

## 📈 Step 14: Example Database Response

| event_name | product_name | value | currency | created_at |
|------------|--------------|-------|----------|------------|
| ViewContent | Premium Shirt | 100 | USD | 2026-05-10 14:30:00 |
| AddToCart | Premium Shirt | 100 | USD | 2026-05-10 14:31:00 |
| AddToCart | Blue Pants | 75 | USD | 2026-05-10 14:32:00 |
| InitiateCheckout | - | 175 | USD | 2026-05-10 14:35:00 |
| Purchase | - | 175 | USD | 2026-05-10 14:38:00 |

---

## 🧪 Step 15: Testing in TikTok Events Manager

### Access Test Events
```
https://ads.tiktok.com/events
```

### Manual Test from Browser Console

```javascript
// Open DevTools (F12) and run:

// Test ViewContent
ttq.track('ViewContent', {
  contents: [{
    content_id: 'PROD-123',
    content_type: 'product',
    content_name: 'Test Product'
  }],
  value: 100,
  currency: 'USD'
});

// Test AddToCart
ttq.track('AddToCart', {
  contents: [{
    content_id: 'PROD-123',
    content_type: 'product',
    content_name: 'Test Product'
  }],
  value: 100,
  currency: 'USD'
});

// Test Purchase
ttq.track('Purchase', {
  contents: [{
    content_id: 'PROD-123',
    content_type: 'product',
    content_name: 'Test Product',
    quantity: 1,
    price: 100
  }],
  value: 100,
  currency: 'USD',
  num_items: 1
});

// Check pixel is loaded
console.log('Pixel ready:', !!window.ttq?.track);
```

---

## ✅ Step 16: Verification Checklist

- [ ] Environment variables set in `.env`
- [ ] Supabase client initialized
- [ ] Database tables created (users + tiktok_events)
- [ ] RLS policies enabled
- [ ] Hash function working
- [ ] TikTok pixel loader in place
- [ ] Event builder created
- [ ] Pixel initialized in `main.tsx`
- [ ] Product page fires ViewContent
- [ ] AddToCart button fires AddToCart
- [ ] Checkout page fires InitiateCheckout
- [ ] Success page fires Purchase
- [ ] Events appear in Supabase table
- [ ] Events appear in TikTok Test Events
- [ ] No JavaScript errors in console

---

## 🔑 Key Differences from Basic Setup

### Your Advanced Implementation (JT Collections) vs. Basic Setup

| Feature | Basic | Your Project |
|---------|-------|--------------|
| Pixel initialization | Simple | ✅ Wrapped in safe guards |
| Event building | Single products | ✅ Per-item arrays (Purchase) |
| Currency support | USD only | ✅ PKR + USD conversion |
| PII hashing | Basic SHA-256 | ✅ Robust with fallbacks |
| Supabase logging | Basic insert | ✅ Non-blocking with error handling |
| Event IDs | None | ✅ Unique deduplication |
| Search events | Simple | ✅ With debouncing |
| User identification | Basic | ✅ Email + phone + custom ID |

---

## 🚀 Next Steps

1. **Verify Setup:**
   - Check all files exist in `frontend/src/lib/`
   - Verify environment variables in `.env`
   - Test pixel loads (F12 → Console → `console.log(window.ttq)`)

2. **Test Events:**
   - Visit product page → Check ViewContent fires
   - Add to cart → Check AddToCart fires
   - Complete purchase → Check Purchase fires

3. **Configure TikTok Events Manager:**
   - Follow [TIKTOK_EVENTS_BUILDER_SETUP.md](./TIKTOK_EVENTS_BUILDER_SETUP.md)
   - Add all 4 events in Events Builder
   - Test with real events from your site

4. **Monitor:**
   - Check Supabase for event logs
   - Monitor TikTok Test Events tab
   - Watch for campaign optimization

---

## 📞 Troubleshooting

### Pixel Not Loading
```javascript
// Check in console:
console.log('window.ttq exists:', !!window.ttq);
console.log('track function exists:', typeof window.ttq?.track);
```

### Events Not Firing
```javascript
// Check for errors:
ttq.track('Test', { value: 100, currency: 'USD' });
// Check console for errors
```

### Events Not in Supabase
- Verify table exists: `SELECT * FROM tiktok_events LIMIT 1`
- Check RLS policies are set
- Verify insert is not throwing error

### Events Not in TikTok
- Wait 30-60 seconds for TikTok to receive
- Check Test Events tab (not Events tab)
- Verify pixel ID matches: D7VPDSBC77UEKU3Q3CT0

---

## 🎉 Summary

**Your Setup Status:** ✅ COMPLETE

All components are implemented and deployed to production:
- ✅ Pixel initialization
- ✅ Event building
- ✅ Supabase logging
- ✅ All event types
- ✅ User identification
- ✅ PII hashing
- ✅ Production deployment

**Next:** Configure events in TikTok Events Manager using [TIKTOK_EVENTS_BUILDER_SETUP.md](./TIKTOK_EVENTS_BUILDER_SETUP.md)
