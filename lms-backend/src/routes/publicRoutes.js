const express = require('express');
const publicController = require('../controllers/publicController');

const router = express.Router();

// No protect middleware — all routes here are public
router.get('/top-five', publicController.getPublicTopFive);
router.get('/leaderboard', publicController.getPublicLeaderboard);
router.get('/profile/:id', publicController.getPublicProfile);
router.get('/profile/:id/analytics', publicController.getPublicAnalytics);

module.exports = router;
