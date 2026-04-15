# Project Structure - Frontend & Backend Separation

## 📁 Project Layout

```
JT Collection/
├── frontend/                      # React + Vite Frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/        
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── public/
│   ├── .env.local              # Frontend environment config (SUPABASE + API_URL)
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── backend/                       # Express + TypeScript Backend
│   ├── src/
│   │   ├── config/
│   │   │   └── supabaseClient.ts
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.ts
│   │   │   └── admin.middleware.ts
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   ├── product.controller.ts
│   │   │   ├── order.controller.ts
│   │   │   └── user.controller.ts
│   │   ├── services/
│   │   │   ├── product.service.ts
│   │   │   └── order.service.ts
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── product.routes.ts
│   │   │   ├── order.routes.ts
│   │   │   └── user.routes.ts
│   │   ├── utils/
│   │   │   └── errorHandler.ts
│   │   ├── app.ts               # Express app configuration
│   │   └── index.ts             # Server entry point
│   ├── .env                      # Backend environment config (SUPABASE + PORT)
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   └── tsconfig.node.json
│
├── database/                      # Database schema & seed data
│   ├── DATABASE_DOCUMENTATION.md
│   ├── schemaa.sql
│   └── seed/
│       ├── complete_seed.sql
│       └── seed.sql
├── supabase/                      # Supabase configuration
│   └── .env
│
├── package.json                   # Root package.json with concurrent scripts
├── tsconfig.json                  # Root TypeScript config
└── README.md
```

## 🚀 Running the Project

### Option 1: Run Both Frontend & Backend Concurrently
```bash
npm install
cd frontend && npm install
cd ../backend && npm install
cd ..
npm run dev
```

### Option 2: Run Frontend Only
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

### Option 3: Run Backend Only
```bash
cd backend
npm run dev
# Runs on http://localhost:3001
```

## 📦 What's Where

### Frontend (`frontend/`)
- **Technology**: React 19.2 + TypeScript + Vite + React Router
- **Purpose**: User-facing ecommerce interface
- **Port**: 5173
- **Environment**: `.env.local`
  - `VITE_SUPABASE_URL` - Supabase project URL
  - `VITE_SUPABASE_ANON_KEY` - Supabase public key
  - `VITE_API_URL` - Backend API URL (http://localhost:3001)

### Backend (`backend/`)
- **Technology**: Node.js + Express + TypeScript
- **Purpose**: REST API for frontend consumption
- **Port**: 3001
- **Architecture**: 
  - Middleware layer (auth, admin checks)
  - Controller layer (request handling)
  - Service layer (business logic)
  - Route layer (API endpoints)

### Backend Environment (`.env`)
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase public key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase admin key
- `PORT` - Server port (3001)
- `JWT_SECRET` - JWT signing secret

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile (protected)

### Products
- `GET /api/products` - List products (public)
- `GET /api/products/:id` - Get product details (public)
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)
- `GET /api/products/categories` - List categories (public)

### Orders
- `POST /api/orders` - Create order (authenticated)
- `GET /api/orders/my-orders` - Get user's orders (authenticated)
- `GET /api/orders` - List all orders (admin only)
- `GET /api/orders/:id` - Get order details (admin only)
- `PUT /api/orders/:id` - Update order status (admin only)
- `DELETE /api/orders/:id` - Delete order (admin only)
- `GET /api/orders/stats` - Order statistics (public)

### Users (Admin Only)
- `GET /api/users` - List all users
- `GET /api/users/:id` - Get user details
- `PUT /api/users/:id/role` - Assign admin role
- `DELETE /api/users/:id` - Delete user

## 🔒 Security Features

- **JWT Authentication**: Token-based user verification
- **Role-Based Access Control**: Admin vs User permissions
- **Middleware Protection**: Auth middleware protects sensitive endpoints
- **Supabase RLS**: Database-level row security policies
- **CORS Configuration**: Allows frontend requests from localhost:5173
- **Error Handling**: Centralized error handling with proper HTTP status codes

## 📝 Development Workflow

1. **Start Backend**: `cd backend && npm run dev`
2. **Start Frontend**: `cd frontend && npm run dev` (in another terminal)
3. **Or Run Both**: From root, `npm run dev`
4. **API calls**: Frontend uses `VITE_API_URL` from `.env.local`
5. **Authentication**: Store JWT token from login, send in Authorization header

## 🛠 Build & Production

```bash
# Build both
npm run build

# Preview production build
npm run preview
```

---

**Created**: April 13, 2026
**Project**: JT Collection - E-commerce Platform
