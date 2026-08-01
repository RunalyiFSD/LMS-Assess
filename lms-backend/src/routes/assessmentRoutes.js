const express = require('express');
const assessmentController = require('../controllers/assessmentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);

router
  .route('/assign')
  .post(authorize('admin', 'instructor'), assessmentController.assignAssessment);

router
  .route('/my-created')
  .get(authorize('admin', 'instructor'), assessmentController.getMyCreatedAssessments);

router
  .route('/clear-all')
  .delete(authorize('admin', 'instructor'), assessmentController.clearAllAssigned);

router
  .route('/assigned-to-me')
  .get(assessmentController.getAssignedToMe);

router
  .route('/calendar')
  .get(assessmentController.getCalendarEvents)
  .post(authorize('admin', 'instructor'), assessmentController.createCalendarEvent);

router
  .route('/')
  .get(assessmentController.getAllAssessments)
  .post(authorize('admin', 'instructor'), assessmentController.createAssessment);

router
  .route('/:id/dates')
  .put(authorize('admin', 'instructor'), assessmentController.updateAssessmentDates);

router
  .route('/:id')
  .get(assessmentController.getAssessmentDetails)
  .put(authorize('admin', 'instructor'), assessmentController.updateAssessment)
  .delete(authorize('admin', 'instructor'), assessmentController.deleteAssessment);

module.exports = router;
