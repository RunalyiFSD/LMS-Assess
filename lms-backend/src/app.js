const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const Sentry = require('@sentry/node');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const logger = require('./utils/logger');
const routes = require('./routes/index');
const errorMiddleware = require('./middleware/errorMiddleware');
const AppError = require('./utils/AppError');

const app = express();

// Initialize Sentry
Sentry.init({
  dsn: process.env.SENTRY_DSN || '', // Add real DSN in .env
  tracesSampleRate: 1.0,
});

// Sentry v8+: request/tracing instrumentation is automatic via Sentry.init().
// No requestHandler() or tracingHandler() middleware needed.

// HTTP Request Logging
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// 1. Security Headers
app.use(helmet());

// 2. Enable CORS. Allowing credentials ensures the HTTP-only cookie is read by the server
app.use(
  cors({
    origin: process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// 3. Rate Limiting
// Auth routes: strict limit to mitigate credential-stuffing / brute-force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  message: 'Too many auth requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/v1/auth', authLimiter);

// General API: higher ceiling — a single dashboard session makes ~10 requests on load
// plus the Header notification poll every 20s (~45/15min). 500 provides comfortable headroom.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

// 4. Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

// 5. Swagger API Docs
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: { title: 'LMS Access API', version: '1.0.0' },
  },
  apis: ['./src/routes/*.js'],
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 6. API Router Entry point — all routes accessible under /api/v1/...
app.use('/api/v1', routes);


// 7. Wildcard Catch-all for undefined routes
app.all('/*splat', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// 8. Sentry error capture — must be registered before the custom error handler.
// setupExpressErrorHandler is the v8+ replacement for Sentry.Handlers.errorHandler().
// Guard with a DSN check so local dev without a DSN doesn't throw.
if (process.env.SENTRY_DSN) {
  Sentry.setupExpressErrorHandler(app);
}

// 9. Centralized Global Error Handler
app.use(errorMiddleware);

module.exports = app;
