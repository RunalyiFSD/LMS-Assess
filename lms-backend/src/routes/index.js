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

const router = express.Router();

const { sendSuccess } = require('../helpers/apiResponse');

// v1 API Routes
router.get('/v1/health', (req, res) => {
  return sendSuccess(res, { service: 'lms-backend', status: 'ok' }, 'Backend is running');
});

// Mount Routes
router.use('/v1/auth', authRoutes);
router.use('/v1/courses', courseRoutes);
router.use('/v1/assessments', assessmentRoutes);
router.use('/v1/questions', questionRoutes);
router.use('/v1/submissions', submissionRoutes);
router.use('/v1/leaderboard', leaderboardRoutes);
router.use('/v1/notifications', notificationRoutes);
router.use('/v1/users', userRoutes);
router.use('/v1/ai', aiRoutes);

module.exports = router;
