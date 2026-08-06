const express = require('express');
const attemptController = require('../controllers/attemptController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { codeExecutionLimiter } = require('../middleware/rateLimitMiddleware');

const router = express.Router();

router.use(protect);

router.post('/start/:assessmentId', authorize('student'), attemptController.startAssessment);
router.get('/my-attempts', authorize('student'), attemptController.getMyAttempts);
router.get('/:id', attemptController.getAttemptDetails);
router.put('/:id/auto-save', authorize('student'), attemptController.autoSaveAttempt);
router.post('/:id/submit', authorize('student'), attemptController.submitAssessment);
router.post('/:id/run-code', authorize('student'), codeExecutionLimiter, attemptController.runCode);

router.get('/all-submissions', authorize('admin', 'instructor'), attemptController.getAllSubmissions);
router.get('/assessment/:assessmentId', authorize('admin', 'instructor'), attemptController.getAssessmentAttempts);
router.put('/:id/grade', authorize('admin', 'instructor'), attemptController.gradeTheoryAttempt);

module.exports = router;
