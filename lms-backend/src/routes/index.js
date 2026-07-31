const express = require('express');
const authRoutes = require('./authRoutes');
const subjectRoutes = require('./subjectRoutes');
const questionRoutes = require('./questionRoutes');
const assessmentRoutes = require('./assessmentRoutes');
const attemptRoutes = require('./attemptRoutes');
const notificationRoutes = require('./notificationRoutes');
const leaderboardRoutes = require('./leaderboardRoutes');
const userRoutes = require('./userRoutes');
const publicRoutes = require('./publicRoutes');
const healthRoutes = require('./healthRoutes');
const aiRoutes = require('../ai/routes/aiRoutes');
const { authLimiter } = require('../middleware/rateLimitMiddleware');
const messageRoutes = require('./messageRoutes');
const departmentRoutes = require('./departmentRoutes');
const batchRoutes = require('./batchRoutes');

const router = express.Router();

router.use('/v1/ai', aiRoutes);
router.use('/health', healthRoutes);
router.use('/auth', authLimiter, authRoutes);
router.use('/subjects', subjectRoutes);
router.use('/questions', questionRoutes);
router.use('/assessments', assessmentRoutes);
router.use('/attempts', attemptRoutes);
router.use('/notifications', notificationRoutes);
router.use('/leaderboard', leaderboardRoutes);
router.use('/users', userRoutes);
router.use('/messages', messageRoutes);
router.use('/departments', departmentRoutes);
router.use('/batches', batchRoutes);
router.use('/public', publicRoutes); // No auth — safe public data only

module.exports = router;
