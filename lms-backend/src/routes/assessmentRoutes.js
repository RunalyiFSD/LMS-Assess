const express = require('express');
const assessmentController = require('../controllers/assessmentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(assessmentController.getAllAssessments)
  .post(authorize('admin', 'teacher'), assessmentController.createAssessment);

router
  .route('/:id')
  .get(assessmentController.getAssessmentDetails)
  .put(authorize('admin', 'teacher'), assessmentController.updateAssessment)
  .delete(authorize('admin', 'teacher'), assessmentController.deleteAssessment);

module.exports = router;
