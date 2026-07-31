const express = require('express');
const departmentController = require('../controllers/departmentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(departmentController.getAllDepartments)
  .post(authorize('admin'), departmentController.createDepartment);

router
  .route('/:id')
  .get(departmentController.getDepartmentById)
  .put(authorize('admin'), departmentController.updateDepartment)
  .delete(authorize('admin'), departmentController.deleteDepartment);

module.exports = router;
