/**
 * Request ID Middleware
 *
 * Purpose:
 *   Assigns a unique ID to every incoming request.
 *   This is essential for tracing a request's lifecycle through logs,
 *   especially when AI LLM calls are involved and asynchronous.
 *
 * Responsibilities:
 *   - Generate UUID
 *   - Attach to req object for internal use
 *   - Attach to res headers for client tracking
 *
 * Dependencies:
 *   - crypto (Node built-in)
 */

const crypto = require('crypto');

const requestIdMiddleware = (req, res, next) => {
  // If the client or upstream proxy already provided a request ID, use it.
  // Otherwise, generate a new UUID.
  const reqId = req.headers['x-request-id'] || crypto.randomUUID();
  
  // Attach to request for logging inside controllers/services
  req.id = reqId;

  // Send back to client for correlation in bug reports
  res.setHeader('X-Request-ID', reqId);

  next();
};

module.exports = requestIdMiddleware;
