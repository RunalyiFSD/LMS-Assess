const express = require('express');
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);

// Student profile pages (accessible to all authenticated users for viewing public profiles)
router.get('/profile/:id', userController.getUserProfile);
router.get('/profile/:id/analytics', userController.getUserAnalytics);
router.put('/profile', userController.updateUserProfile);

// Admin-only user management routes
router.use(authorize('admin'));
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router.route('/:id').delete(userController.deleteUser);

module.exports = router;
