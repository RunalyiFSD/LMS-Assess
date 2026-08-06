const express = require('express');
const subjectController = require('../controllers/subjectController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(subjectController.getAllSubjects)
  .post(authorize('admin', 'instructor'), subjectController.createSubject);

router
  .route('/:id')
  .get(subjectController.getSubjectDetails)
  .put(authorize('admin'), subjectController.updateSubject)
  .delete(authorize('admin'), subjectController.deleteSubject);

module.exports = router;
