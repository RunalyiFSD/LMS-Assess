const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const { protect } = require('../middleware/authMiddleware');
const restrictTo = require('../middleware/roleMiddleware');
const ROLES = require('../constants/roles');

router.use(protect);

// Student actions
router.get('/:id', restrictTo(ROLES.STUDENT), submissionController.getSubmissionDetails);
router.post('/start', restrictTo(ROLES.STUDENT), submissionController.startSubmission);
router.put('/:id/save', restrictTo(ROLES.STUDENT), submissionController.saveAnswers);
router.post('/:id/submit', restrictTo(ROLES.STUDENT), submissionController.submitFinal);

// Teacher actions
router.get('/assessment/:assessmentId', restrictTo(ROLES.TEACHER, ROLES.ADMIN), submissionController.getSubmissionsForAssessment);
router.put('/:id/grade', restrictTo(ROLES.TEACHER, ROLES.ADMIN), submissionController.gradeSubmission);

module.exports = router;
