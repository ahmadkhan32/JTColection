# JT Collections - Production E-Commerce

A full-stack premium e-commerce solution built with React, TypeScript, Tailwind CSS, and Supabase.

## 🚀 Final Project Structure

```
ecommerce-app/
│
├── client/ (React + TypeScript)
├── supabase/ (Backend functions)
├── database/ (SQL schema)
├── .env
└── README.md
```

## 🛠️ Tech Stack
-   **Frontend**: React 19, Vite, Framer Motion, Tailwind CSS
-   **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
-   **Payment**: Razorpay Integrated

## ⚙️ Setup
1.  **Frontend**: `cd client && npm install && npm run dev`
2.  **Environment**: Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to `client/.env`.
3.  **Database**: Run the SQL in `database/schema.sql` within your Supabase SQL Editor.

## ✅ Features
-   Full Customer Storefront
-   Complete Admin Dashboard (CRUD)
-   Animated UI with Framer Motion
-   Responsive Design (sm, md, lg, xl)
