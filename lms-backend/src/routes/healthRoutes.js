/**
 * Health Check Router
 *
 * Purpose:
 *   Provides a canonical endpoint for deployment probes and AI pre-flight checks.
 *
 * Responsibilities:
 *   - Return 200 OK if server is up
 *   - Report environment mode
 *   - Report AI configuration status (Phase 1/2)
 *
 * Dependencies:
 *   - express
 *   - mongoose (for DB connection status check later)
 */

const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// @desc    Get API health status
// @route   GET /api/health
// @access  Public
router.get('/', (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;

  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: isDbConnected ? 'connected' : 'disconnected',
    ai: {
      enabled: process.env.AI_ENABLED === 'true',
      configured: false, // Will be updated in Phase 1 when aiConfig is ready
      provider: null,
    },
  });
});

module.exports = router;
