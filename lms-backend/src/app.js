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

// The request handler must be the first middleware on the app
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

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

// 3. Rate Limiting (apply to auth routes specifically, but general limiter for now)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

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

// 6. API Router Entry point
app.use('/api/v1', routes);
app.use('/api', routes); // Fallback for some routes if they don't have v1

// 7. Wildcard Catch-all for undefined routes
app.all('/*splat', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// The error handler must be before any other error middleware and after all controllers
app.use(Sentry.Handlers.errorHandler());

// 8. Centralized Global Error Handler
app.use(errorMiddleware);

module.exports = app;
