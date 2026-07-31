const express = require('express');
const assessmentController = require('../controllers/assessmentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);

router
  .route('/calendar')
  .get(assessmentController.getCalendarEvents)
  .post(authorize('admin', 'instructor'), assessmentController.createCalendarEvent);

router
  .route('/')
  .get(assessmentController.getAllAssessments)
  .post(authorize('admin', 'instructor'), assessmentController.createAssessment);

router
  .route('/:id')
  .get(assessmentController.getAssessmentDetails)
  .put(authorize('admin', 'instructor'), assessmentController.updateAssessment)
  .delete(authorize('admin', 'instructor'), assessmentController.deleteAssessment);

module.exports = router;
