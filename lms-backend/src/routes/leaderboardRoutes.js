const express = require('express');
const leaderboardController = require('../controllers/leaderboardController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/top-five', leaderboardController.getTopFiveStudents);
router.get('/global', leaderboardController.getGlobalLeaderboard);
router.get('/:assessmentId', leaderboardController.getAssessmentLeaderboard);

module.exports = router;
