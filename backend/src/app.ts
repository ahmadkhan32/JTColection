import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import orderRoutes from './routes/order.routes.js';
import adminRoutes from './routes/admin.routes.js';
import productRoutes from './routes/product.routes.js';
import categoryRoutes from './routes/category.routes.js';
import userRoutes from './routes/user.routes.js';
import cartRoutes from './routes/cart.routes.js';
import shippingRoutes from './routes/shipping.routes.js';
import returnRoutes from './routes/return.routes.js';
import exportRoutes from './routes/export.routes.js';
import metaEventRoutes from './routes/metaEvent.routes.js';
import tiktokEventRoutes from './routes/tiktokEvent.routes.js';

const app = express();

// Respect reverse proxies so req.ip / x-forwarded-for reflect the real client IP.
app.set('trust proxy', true);

// Allow origins from env (comma-separated) or mirror request origin (works with credentials)
const corsOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : true;
app.use(cors({ origin: corsOrigins, credentials: true }));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Backend is running', timestamp: new Date() });
});

// Mount all API routes
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use('/api/categories', categoryRoutes);
app.use("/api/users", userRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/shipping", shippingRoutes);
app.use("/api/returns", returnRoutes);
app.use("/api/admin/export", exportRoutes);
app.use("/api/meta", metaEventRoutes);
app.use("/api/tiktok", tiktokEventRoutes);

export default app;
