const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const routes = require('./routes/index');
const errorMiddleware = require('./middleware/errorMiddleware');
const AppError = require('./utils/AppError');
const { globalLimiter } = require('./middleware/rateLimitMiddleware');
const requestIdMiddleware = require('./middleware/requestIdMiddleware');

const app = express();

// -2. Security HTTP Headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// -1. Request ID (attach to all requests first)
app.use(requestIdMiddleware);

// 0. Request logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// 0.1 Global Rate Limiting
// Apply to all requests under /api to prevent abuse
app.use('/api', globalLimiter);

// 1. Dynamic CORS Configuration
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((origin) => origin.trim())
  : ['http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
        return callback(null, true);
      }
      return callback(new AppError(`CORS policy blocked access from origin: ${origin}`, 403));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// 2. Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

// 3. API Router Entry point
app.use('/api', routes);

// 4. Wildcard Catch-all for undefined routes
app.all('/*splat', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// 5. Centralized Global Error Handler
app.use(errorMiddleware);

module.exports = app;
