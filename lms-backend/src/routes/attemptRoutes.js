const express = require('express');
const attemptController = require('../controllers/attemptController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);

// ─── Literal static routes MUST come before parameterized /:id routes ───────
// Express matches top-down; placing /:id first would intercept 'my-attempts',
// 'all-submissions', and 'assessment/:assessmentId' as ObjectId params and
// produce a CastError. All static paths are registered here first.

router.post('/start/:assessmentId', authorize('student'), attemptController.startAssessment);
router.get('/my-attempts', authorize('student'), attemptController.getMyAttempts);
router.get('/all-submissions', authorize('admin', 'instructor'), attemptController.getAllSubmissions);
router.get('/assessment/:assessmentId', authorize('admin', 'instructor'), attemptController.getAssessmentAttempts);

// ─── Parameterized routes come last ──────────────────────────────────────────
router.get('/:id', attemptController.getAttemptDetails);
router.put('/:id/auto-save', authorize('student'), attemptController.autoSaveAttempt);
router.post('/:id/submit', authorize('student'), attemptController.submitAssessment);
router.post('/:id/run-code', authorize('student'), attemptController.runCode);
router.put('/:id/grade', authorize('admin', 'instructor'), attemptController.gradeTheoryAttempt);

module.exports = router;
