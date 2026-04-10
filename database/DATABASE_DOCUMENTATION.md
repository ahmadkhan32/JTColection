# 🗄️ JT Collections: Database Schema Documentation

This document provides a detailed explanation of the **Smart Unified Schema** (`schemaa.sql`) used in the JT Collections Ecommerce System. 

## 🏗️ Core Architecture
The database is built on **PostgreSQL** (via Supabase) and is designed for a **Cash on Delivery (COD)** business model with support for high-precision product variants.

---

## 👥 1. User Management (`users`)
Stores the profiles for both customers and administrators.
- `id`: Unique identifier linked to Supabase Auth.
- `role`: Distinguishes between standard `user` and `admin` (who can access the dashboard).

## 🏷️ 2. Product Catalog (`categories` & `products`)
Handles the inventory and categorization.
- **Categories**: Groups products (e.g., "Silk Suits", "Bridal").
- **Products**: Stores the "Boutique" content.
    - `price` vs `old_price`: Enables "Sale" badges.
    - `sizes` & `colors`: Stored as **Arrays** to allow multiple variants for a single product entry.
    - `stock`: Controls the "Stock Running Low" alerts in the UI.

## 🛒 3. Shopping Experience (`cart`)
A temporary storage table for items users intend to buy.
- Cross-references `user_id` and `product_id`.
- Includes `selected_size` and `selected_color` to capture the exact choice before checkout.

## 🧾 4. The Order System (`orders` & `order_items`)
This is the heart of the **COD System**.
- **Orders**: Stores the high-level delivery information.
    - Captures `customer_name`, `phone`, `address`, and `city` directly to ensure deliveries reach the right doorstep.
    - `total_amount`: The final price including shipping.
- **Order Items**: A relational table that stores the "snapshot" of what was bought.
    - Even if a product price changes later, this table preserves the price at the time of purchase.
    - Captures the specific **Size** and **Color** for the warehouse to fulfill.

---

## 🧠 5. The "Smart Migration" Logic
The bottom of the script contains "Conditional Logic" (using `DO` blocks and `IF NOT EXISTS`). This is a **Boutique-Grade safety feature**:

### Why it's there:
1. **Safety**: If you run the script on a database that already has a `total` column, it will rename it to `total_amount` automatically.
2. **Persistence**: It adds columns like `sizes` and `colors` only if they are missing, ensuring you don't lose existing data.
3. **Fail-Proof**: It allows you to run the **entire file** at any time to "heal" your database schema if something goes wrong.

---

## 🚀 Deployment Instructions
To apply this schema:
1. Copy the contents of `schemaa.sql`.
2. Paste into the **Supabase SQL Editor**.
3. Click **Run**.

> [!TIP]
> Always ensure Row Level Security (RLS) is configured in the Supabase Dashboard for the `users` and `orders` tables to protect customer privacy.
