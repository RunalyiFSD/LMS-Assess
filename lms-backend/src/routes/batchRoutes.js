const express = require('express');
const batchController = require('../controllers/batchController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(batchController.getAllBatches)
  .post(authorize('admin'), batchController.createBatch);

router
  .route('/:id')
  .put(authorize('admin'), batchController.updateBatch)
  .delete(authorize('admin'), batchController.deleteBatch);

module.exports = router;
