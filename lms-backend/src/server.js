const dotenv = require('dotenv');
// Load environment variables before importing files using them
dotenv.config();

const app = require('./app');
const supabase = require('./config/supabase');

const PORT = process.env.PORT || 5000;

// 1. Log Supabase status
if (supabase) {
  console.log('[Supabase] Client initialized successfully.');
} else {
  console.warn('[Supabase] Client NOT initialized — set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
}

// 2. Start Express server
const server = app.listen(PORT, () => {
  console.log(`[Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections globally
process.on('unhandledRejection', (err) => {
  console.error('[Server] UNHANDLED REJECTION — Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions globally
process.on('uncaughtException', (err) => {
  console.error('[Server] UNCAUGHT EXCEPTION — Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});
