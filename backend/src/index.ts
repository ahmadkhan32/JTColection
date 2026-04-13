import 'dotenv/config';
import app from './app.js';

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════════════════════╗
  ║     🚀 JT Collection Backend Server Started            ║
  ║                                                        ║
  ║   🌐 Server running at: http://localhost:${PORT}        ║
  ║                                                        ║
  ║   📍 Available Routes:                                 ║
  ║      GET    /health                 - Health check     ║
  ║      POST   /api/auth/signup        - User signup      ║
  ║      POST   /api/auth/login         - User login       ║
  ║      GET    /api/auth/me            - Get user profile ║
  ║      GET    /api/products           - List products    ║
  ║      POST   /api/products           - Create product   ║
  ║      PUT    /api/products/:id       - Update product   ║
  ║      DELETE /api/products/:id       - Delete product   ║
  ║      GET    /api/orders             - List orders      ║
  ║      POST   /api/orders             - Create order     ║
  ║      GET    /api/orders/my-orders   - User orders      ║
  ║      PUT    /api/orders/:id         - Update order     ║
  ║      DELETE /api/orders/:id         - Delete order     ║
  ║      GET    /api/users              - List users       ║
  ║      PUT    /api/users/:id/role     - Assign admin     ║
  ║      DELETE /api/users/:id          - Delete user      ║
  ║                                                        ║
  ║   📦 Database: Supabase Cloud                          ║
  ║   🔒 Authentication: Supabase Auth + JWT Tokens        ║
  ╚════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, closing server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
