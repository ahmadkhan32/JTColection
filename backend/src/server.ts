import 'dotenv/config';
import app from './app.js';

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown — lets tsx watch properly release the port before restart
const shutdown = (signal: string) => {
  server.close(() => {
    process.exit(0);
  });
  // Force exit after 3s if connections hang
  setTimeout(() => process.exit(0), 3000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));
process.on('SIGUSR2', () => shutdown('SIGUSR2')); // used by nodemon