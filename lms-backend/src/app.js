const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const routes = require('./routes/index');
const errorMiddleware = require('./middleware/errorMiddleware');
const AppError = require('./utils/AppError');
const logger = require('./utils/logger');
const { globalLimiter } = require('./middleware/rateLimitMiddleware');
const requestIdMiddleware = require('./middleware/requestIdMiddleware');

const app = express();

// -1. Request ID (attach to all requests first)
app.use(requestIdMiddleware);

// 0. Request logging via Winston logger stream
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev', { stream: logger.stream }));
} else {
  app.use(morgan('combined', { stream: logger.stream }));
}

// 0.1 Global Rate Limiting
// Apply to all requests under /api to prevent abuse
app.use('/api', globalLimiter);

// 1. Enable CORS. Allowing credentials ensures the HTTP-only cookie is read by the server
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], // standard React Vite local ports
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
