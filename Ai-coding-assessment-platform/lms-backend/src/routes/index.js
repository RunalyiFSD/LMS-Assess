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
const messageRoutes = require('./messageRoutes');
const departmentRoutes = require('./departmentRoutes');
const batchRoutes = require('./batchRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
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
