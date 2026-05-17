# TikTok Events - Exact Code Payloads

This document shows the EXACT code currently firing each TikTok event on your production site.

---

## 1️⃣ ViewContent Event

**Fired When**: User opens a product detail page

**File**: `frontend/src/pages/ProductPage.tsx`

**Code**:
```typescript
useEffect(() => {
  if (id && data) {
    logTikTokEvent({
      eventName: 'ViewContent',
      productId: id,
      productName: data?.title ?? '',
      value: data?.price ?? 0,
      currency: 'PKR',
    });
  }
}, [id, data]);
```

**Example Payload Sent to TikTok**:
```javascript
{
  event: 'ViewContent',
  event_id: 'view-content-12345678',
  currency: 'PKR',
  value: 2500,
  contents: [
    {
      content_id: 'prod-xyz-123',
      content_type: 'product',
      content_name: 'Blue Shirt'
    }
  ]
}
```

**What TikTok Tracks**: 
- 👁️ User viewed product "Blue Shirt" priced at 2500 PKR

---

## 2️⃣ AddToCart Event

**Fired When**: User clicks the bag icon to add product to cart (ProductCard or ProductPage)

**Files**: 
- `frontend/src/components/product/ProductCard.tsx` (grid items)
- `frontend/src/pages/ProductPage.tsx` (product detail page)

**Code**:
```typescript
// ProductCard.tsx
onClick={(e) => {
  e.preventDefault();
  logTikTokEvent({
    eventName: 'AddToCart',
    productId: id,
    productName: title,
    value: price,
    currency: 'PKR',
  });
  addToCart({ id, title, price, image_url, quantity: 1 });
}}

// ProductPage.tsx  
onAddToCart={(prod, vars) => {
  logTikTokEvent({
    eventName: 'AddToCart',
    productId: product.id,
    productName: product.title,
    value: prod.price,
    currency: 'PKR',
  });
  // ... add to cart logic
}
```

**Example Payload Sent to TikTok**:
```javascript
{
  event: 'AddToCart',
  event_id: 'add-to-cart-87654321',
  currency: 'PKR',
  value: 2500,
  contents: [
    {
      content_id: 'prod-xyz-123',
      content_type: 'product',
      content_name: 'Blue Shirt'
    }
  ]
}
```

**What TikTok Tracks**: 
- 🛍️ User added "Blue Shirt" (2500 PKR) to shopping cart

---

## 3️⃣ InitiateCheckout Event

**Fired When**: User clicks "Proceed to Checkout" button on cart page

**File**: `frontend/src/pages/CartPage.tsx`

**Code**:
```typescript
<Link 
  to="/checkout" 
  onClick={() => {
    logTikTokEvent({
      eventName: 'InitiateCheckout',
      productId: cart.map(i => i.id).join('|') || 'checkout-session',
      productName: cart.map(i => i.title).join(', '),
      value: total,
      currency: 'PKR',
    });
  }}
>
  Proceed to Checkout
</Link>
```

**Example Payload Sent to TikTok**:
```javascript
{
  event: 'InitiateCheckout',
  event_id: 'checkout-init-11223344',
  currency: 'PKR',
  value: 7500,  // Total cart value
  num_items: 3,
  contents: [
    {
      content_id: 'prod-xyz-123|prod-abc-456|prod-def-789',
      content_type: 'product',
      content_name: 'Blue Shirt, Red Pants, Black Jacket'
    }
  ]
}
```

**What TikTok Tracks**: 
- 🛒 User initiated checkout with 3 items totaling 7500 PKR

---

## 4️⃣ Purchase Event (Most Important!)

**Fired When**: User successfully completes order on checkout page

**File**: `frontend/src/pages/CheckoutPage.tsx`

**Code**:
```typescript
// After successful order creation
const response = await createOrder({
  // ... order data
});

if (response?.success) {
  const orderId = response.data.id;
  
  // Fire Purchase event with ITEM-LEVEL contents
  await logTikTokEvent({
    eventName: 'Purchase',
    productId: String(orderId),
    productName: 'Order ' + orderId,
    value: convert(total),
    currency,
    extraPayload: {
      contents: cart.map(item => ({
        content_id: item.id,
        content_type: 'product',
        content_name: item.title,
        quantity: item.quantity,
        price: item.price,
      })),
    },
  });
}
```

**Example Payload Sent to TikTok**:
```javascript
{
  event: 'Purchase',
  event_id: 'purchase-99887766',
  currency: 'PKR',
  value: 7500,  // Total order value
  num_items: 3,
  contents: [
    {
      content_id: 'prod-xyz-123',
      content_type: 'product',
      content_name: 'Blue Shirt',
      quantity: 1,
      price: 2500
    },
    {
      content_id: 'prod-abc-456',
      content_type: 'product',
      content_name: 'Red Pants',
      quantity: 1,
      price: 2500
    },
    {
      content_id: 'prod-def-789',
      content_type: 'product',
      content_name: 'Black Jacket',
      quantity: 1,
      price: 2500
    }
  ]
}
```

**What TikTok Tracks**: 
- ✅ User completed purchase with order ID #99887766
- 🎯 **Key Difference**: Purchase includes item-by-item breakdown (contents array) with quantity and price per item
- 💰 Total order value: 7500 PKR

**⚠️ Why This Matters**: 
TikTok requires `contents` to be an **array of items** for Purchase events, not a single aggregated item. Each item must have:
- `content_id` - unique product ID
- `content_type` - "product"
- `content_name` - product name
- `quantity` - how many of this item
- `price` - price per item

---

## 5️⃣ Search Event (Bonus)

**Fired When**: User types in search box on Products page

**File**: `frontend/src/pages/ProductsPage.tsx`

**Code**:
```typescript
useEffect(() => {
  if (debouncedSearch.trim()) {
    logTikTokEvent({
      eventName: 'Search',
      productId: '',
      productName: debouncedSearch,
      value: 0,
      currency: 'PKR',
      searchString: debouncedSearch,
    });
  }
}, [debouncedSearch]);
```

**Example Payload**:
```javascript
{
  event: 'Search',
  event_id: 'search-55443322',
  currency: 'PKR',
  value: 0,
  search_string: 'blue shirt',
  contents: [
    {
      content_id: 'search-blue shirt',
      content_type: 'product',
      content_name: 'blue shirt'
    }
  ]
}
```

---

## 6️⃣ AddToWishlist Event (Bonus)

**Fired When**: User clicks heart icon to add product to wishlist

**File**: `frontend/src/components/wishlist/WishlistButton.tsx`

**Code**:
```typescript
onClick={() => {
  if (!isWished) {
    logTikTokEvent({
      eventName: 'AddToWishlist',
      productId,
      productName,
      value: productPrice,
      currency: 'PKR',
    });
  }
  toggleWishlist(productId);
}}
```

**Example Payload**:
```javascript
{
  event: 'AddToWishlist',
  event_id: 'wishlist-33221100',
  currency: 'PKR',
  value: 2500,
  contents: [
    {
      content_id: 'prod-xyz-123',
      content_type: 'product',
      content_name: 'Blue Shirt'
    }
  ]
}
```

---

## 📊 Payload Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    User Action                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   logTikTokEvent() Called                        │
│          (frontend/src/services/tiktokEventLogger.ts)            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    ┌─────────┴─────────┐
                    ↓                   ↓
        ┌───────────────────┐  ┌──────────────────────┐
        │  Browser Pixel    │  │  Supabase Database   │
        │  window.ttq.track │  │  tiktok_events table │
        │  Fires to TikTok  │  │  Audit Log           │
        └───────────────────┘  └──────────────────────┘
                    ↓                   ↓
        ┌───────────────────┐  ┌──────────────────────┐
        │ TikTok Events     │  │ Your Dashboard       │
        │ Manager - Test    │  │ View all events      │
        │ Events Tab        │  │ Debug & analyze      │
        └───────────────────┘  └──────────────────────┘
```

---

## ✅ Verification Checklist

- ✅ All 4 events (ViewContent, AddToCart, InitiateCheckout, Purchase) are instrumented
- ✅ Each event includes required fields: `currency`, `value`, `contents` array
- ✅ Purchase event includes item-by-item breakdown with `quantity` and `price`
- ✅ Event IDs are generated for deduplication
- ✅ Payloads logged to Supabase for audit trail
- ✅ Production code deployed to Vercel

---

## 🚀 Test These Exact Payloads

To verify the exact payloads are being fired, open browser DevTools (F12) and run:

```javascript
// Watch for TikTok events in console
(function() {
  const originalTrack = window.ttq?.track;
  if (originalTrack) {
    window.ttq.track = function(...args) {
      console.log('🎯 TikTok Event Fired:', {
        event: args[0],
        payload: args[1]
      });
      return originalTrack.apply(this, args);
    };
  }
})();
```

Now when you perform actions (view product, add to cart, checkout), you'll see exact payloads in console.

---

## 📝 Troubleshooting

### Payload Shows Wrong Value
**Check**: Is conversion rate correct?
```typescript
// backend/src/app.ts has currency conversion
const convert = (value: number) => value * 4.75; // PKR to USD example
```

### Purchase Event Missing Item Details
**Check**: Is `extraPayload` with `contents` array being passed?
```typescript
// Must include extraPayload for Purchase
extraPayload: {
  contents: cart.map(item => ({
    content_id: item.id,
    content_type: 'product',
    content_name: item.title,
    quantity: item.quantity,
    price: item.price,
  })),
}
```

### Event Not Firing
**Check**: Is `window.ttq` available?
```javascript
console.log('TikTok Pixel Ready:', !!window.ttq?.track);
```

---

## 💡 Key Differences from Meta Pixel

| Aspect | TikTok | Meta |
|--------|--------|------|
| **Contents Structure** | **Array required** | Single or array |
| **Purchase Format** | Item-level breakdown | Aggregated |
| **Event ID** | Optional but recommended | Optional |
| **Currency** | Must be uppercase ISO | Case-flexible |
| **Quantity Field** | In Purchase only | In all events |

---

**All events are properly configured and deployed to production!** ✅
