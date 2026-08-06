const express = require('express');
const leetcodeController = require('../controllers/leetcodeController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// Public / Authenticated Routes
router.get('/companies', leetcodeController.getCompanies);
router.get('/preview/:companySlug', leetcodeController.previewCompanyQuestions);

// Protected Routes
router.use(protect);

router.post('/import', restrictTo('admin', 'instructor'), leetcodeController.importCompanyQuestions);
router.post('/create-mock', leetcodeController.createCompanyMockAssessment);

module.exports = router;
