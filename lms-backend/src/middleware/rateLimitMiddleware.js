/**
 * Rate Limiting Middleware
 *
 * Purpose:
 *   Protects the API from brute-force attacks and abuse.
 *   Crucial prerequisite for AI integration to prevent exhausting LLM budgets.
 *
 * Responsibilities:
 *   - Global limiter for standard endpoints
 *   - Strict limiter for authentication routes
 *   - AI limiter (prepared for future use)
 *
 * Dependencies:
 *   - express-rate-limit
 */

const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');
const isDev = process.env.NODE_ENV === 'development';

// Global API limiter: 200 requests per 15 minutes per IP (10x in dev)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 2000 : 200,
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again after 15 minutes.',
  },
  handler: (req, res, next, options) => {
    logger.warn(`Global rate limit exceeded for IP: ${req.ip}`);
    res.status(options.statusCode).json(options.message);
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Auth limiter: 20 requests per 15 minutes per IP (10x in dev)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 200 : 20,
  message: {
    status: 'error',
    message: 'Too many login attempts from this IP, please try again after 15 minutes.',
  },
  handler: (req, res, next, options) => {
    logger.warn(`Auth rate limit exceeded for IP: ${req.ip}`);
    res.status(options.statusCode).json(options.message);
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// AI endpoints limiter (ready for Phase 1/2 integration)
// 30 requests per hour per user/IP (10x in dev)
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: isDev ? 300 : 30,
  message: {
    status: 'error',
    message: 'AI request limit reached. Please try again later.',
  },
  handler: (req, res, next, options) => {
    // req.user might be present if placed after authMiddleware
    const identifier = req.user ? `User ${req.user.id}` : `IP ${req.ip}`;
    logger.warn(`AI rate limit exceeded for ${identifier}`);
    res.status(options.statusCode).json(options.message);
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Code execution endpoint limiter: Configurable per authenticated user (e.g. 10 runs per minute)
const codeExecutionLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_CODE_EXEC_WINDOW_MS) || 60 * 1000,
  max: Number(process.env.RATE_LIMIT_CODE_EXEC_MAX) || 10,
  keyGenerator: (req) => (req.user && req.user._id ? req.user._id.toString() : req.ip),
  validate: { keyGeneratorIpFallback: false },
  message: {
    status: 'error',
    message: 'Rate limit exceeded: You have reached the maximum allowed code executions (10 per minute). Please wait a moment before running code again.',
  },
  handler: (req, res, next, options) => {
    const userStr = req.user ? `User ${req.user._id}` : `IP ${req.ip}`;
    logger.warn(`Code execution rate limit exceeded for ${userStr}`);
    res.status(429).json(options.message);
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  globalLimiter,
  authLimiter,
  aiLimiter,
  codeExecutionLimiter,
};
