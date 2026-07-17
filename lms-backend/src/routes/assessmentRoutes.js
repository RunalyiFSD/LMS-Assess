const express = require('express');
const router = express.Router();
const assessmentController = require('../controllers/assessmentController');
const { protect } = require('../middleware/authMiddleware');
const restrictTo = require('../middleware/roleMiddleware');
const ROLES = require('../constants/roles');

router.use(protect);

router.get('/', assessmentController.getAllAssessments);
router.get('/:id', assessmentController.getAssessmentDetails);

// Teacher/Admin only
router.use(restrictTo(ROLES.TEACHER, ROLES.ADMIN));

router.post('/', assessmentController.createAssessment);
router.put('/:id', assessmentController.updateAssessment);
router.delete('/:id', assessmentController.deleteAssessment);

module.exports = router;
