const express = require('express');
const questionController = require('../controllers/questionController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

// All question routes are restricted to Instructors and Administrators
router.use(protect);
router.use(authorize('admin', 'teacher'));

router.route('/').get(questionController.getAllQuestions);

router.route('/:type').post(questionController.createQuestion);

router
  .route('/:type/:id')
  .get(questionController.getQuestionDetails)
  .put(questionController.updateQuestion)
  .delete(questionController.deleteQuestion);

module.exports = router;
