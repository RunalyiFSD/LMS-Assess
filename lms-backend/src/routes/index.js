const express = require('express');

const authRoutes = require('./authRoutes');
const courseRoutes = require('./courseRoutes');
const assessmentRoutes = require('./assessmentRoutes');
const questionRoutes = require('./questionRoutes');
const submissionRoutes = require('./submissionRoutes');
const leaderboardRoutes = require('./leaderboardRoutes');
const notificationRoutes = require('./notificationRoutes');
const userRoutes = require('./userRoutes');
const aiRoutes = require('./aiRoutes');
const subjectRoutes = require('./subjectRoutes');

const router = express.Router();


const { sendSuccess } = require('../helpers/apiResponse');

// Health check endpoint
// Accessible at: GET /api/v1/health
router.get('/health', (req, res) => {
  return sendSuccess(res, { service: 'lms-backend', status: 'ok' }, 'Backend is running');
});

// Mount all route groups
// All routes are prefixed with /api/v1 in app.js
// so these mount points produce: /api/v1/auth, /api/v1/courses, etc.
router.use('/auth', authRoutes);
router.use('/courses', courseRoutes);
router.use('/assessments', assessmentRoutes);
router.use('/questions', questionRoutes);
router.use('/submissions', submissionRoutes);
router.use('/leaderboard', leaderboardRoutes);
router.use('/notifications', notificationRoutes);
router.use('/users', userRoutes);
router.use('/ai', aiRoutes);
router.use('/subjects', subjectRoutes);

module.exports = router;
