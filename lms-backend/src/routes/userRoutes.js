const express = require('express');
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);

// Student profile pages & user directory for messaging
router.get('/directory', userController.getUserDirectory);
router.get('/profile/:id', userController.getUserProfile);
router.get('/profile/:id/analytics', userController.getUserAnalytics);
router.put('/profile', userController.updateUserProfile);
router.delete('/me', userController.deleteMyAccount);

// User routes accessible by Admin & Instructor for viewing lists & details
router.get('/', authorize('admin', 'instructor'), userController.getAllUsers);
router.get('/:id', authorize('admin', 'instructor'), userController.getUserByIdAdmin);

// Admin-only user management routes (creation, modification, deletion)
router.post('/', authorize('admin'), userController.createUser);
router.put('/:id', authorize('admin'), userController.updateUserByAdmin);
router.delete('/:id', authorize('admin'), userController.deleteUser);

module.exports = router;
