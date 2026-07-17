const express = require('express');
const authRoutes = require('./authRoutes');
const subjectRoutes = require('./subjectRoutes');
const questionRoutes = require('./questionRoutes');
const assessmentRoutes = require('./assessmentRoutes');
const attemptRoutes = require('./attemptRoutes');
const notificationRoutes = require('./notificationRoutes');
const leaderboardRoutes = require('./leaderboardRoutes');
const userRoutes = require('./userRoutes');

const router = express.Router();

const { sendSuccess } = require('../helpers/apiResponse');

// v1 API Routes
router.get('/v1/health', (req, res) => {
  return sendSuccess(res, { service: 'lms-backend', status: 'ok' }, 'Backend is running');
});

router.use('/v1/auth', authRoutes);
router.use('/v1/subjects', subjectRoutes);
router.use('/v1/questions', questionRoutes);
router.use('/v1/assessments', assessmentRoutes);
router.use('/v1/attempts', attemptRoutes);
router.use('/v1/notifications', notificationRoutes);
router.use('/v1/leaderboard', leaderboardRoutes);
router.use('/v1/users', userRoutes);

module.exports = router;
