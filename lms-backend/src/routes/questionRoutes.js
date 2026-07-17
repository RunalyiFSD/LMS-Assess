const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const { protect } = require('../middleware/authMiddleware');
const restrictTo = require('../middleware/roleMiddleware');
const ROLES = require('../constants/roles');

router.use(protect);

// Anyone enrolled can view questions for an assessment
router.get('/assessment/:assessmentId', questionController.getQuestionsByAssessment);

// Teacher/Admin only
router.use(restrictTo(ROLES.TEACHER, ROLES.ADMIN));

router.post('/assessment/:assessmentId', questionController.createQuestion);
router.put('/:id', questionController.updateQuestion);
router.delete('/:id', questionController.deleteQuestion);

module.exports = router;
