import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors, { CorsOptions } from 'cors';
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
import bannerRoutes from './routes/banner.routes.js';

const app = express();

// Respect reverse proxies so req.ip / x-forwarded-for reflect the real client IP.
app.set('trust proxy', true);

// Predefined trusted production and development origins
const allowedOrigins = [
  'https://jtcolections.com',
  'https://www.jtcolections.com',
  'https://api.jtcolections.com',
  'https://jtcollections.com',
  'https://www.jtcollections.com',
  'https://api.jtcollections.com',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:3001',
];

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests or requests without Origin header (e.g. mobile apps, curl, Postman, health checks)
    if (!origin) {
      return callback(null, true);
    }

    // Dynamic origins from environment variables
    const envOrigins = (process.env.CORS_ORIGIN || process.env.FRONTEND_URL || process.env.CLIENT_URL || '')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean);

    const allAllowed = new Set([...allowedOrigins, ...envOrigins]);

    if (allAllowed.has(origin)) {
      return callback(null, true);
    }

    // Allow subdomains of jtcolections.com, jtcollections.com, or vercel.app
    try {
      const url = new URL(origin);
      const host = url.hostname;
      if (
        host === 'localhost' ||
        host === '127.0.0.1' ||
        host === 'jtcolections.com' ||
        host === 'jtcollections.com' ||
        host.endsWith('.jtcolections.com') ||
        host.endsWith('.jtcollections.com') ||
        host.endsWith('.vercel.app')
      ) {
        return callback(null, true);
      }
    } catch {
      // ignore parsing error
    }

    console.warn(`[CORS] Blocked origin: ${origin}`);
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'user',
    'apikey',
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  optionsSuccessStatus: 204,
};

// Enable CORS and explicitly handle preflight OPTIONS for all routes
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'Backend is running',
    environment: process.env.NODE_ENV || 'production',
    timestamp: new Date(),
  });
});

// Mount all API routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/api/returns', returnRoutes);
app.use('/api/admin/export', exportRoutes);
app.use('/api/meta', metaEventRoutes);
app.use('/api/tiktok', tiktokEventRoutes);
app.use('/api/banners', bannerRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler (handles CORS errors gracefully)
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  if (err?.message?.includes('Not allowed by CORS')) {
    return res.status(403).json({ success: false, message: err.message });
  }
  console.error('[Unhandled Error]', err);
  return res.status(500).json({ success: false, message: err?.message || 'Internal server error' });
});

export default app;
