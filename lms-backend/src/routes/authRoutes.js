const express = require('express');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimitMiddleware');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authLimiter, authController.login);
router.post('/logout', protect, authController.logout);
router.get('/me', protect, authController.getMe);
router.post('/forgot-password', authLimiter, authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);

// OAuth & Simulation Routes
router.get('/google', authController.googleLogin);
router.get('/google/callback', authController.googleCallback);
router.get('/github', authController.githubLogin);
router.get('/github/callback', authController.githubCallback);
router.get('/simulated', authController.simulatedLogin);

module.exports = router;
