const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const enrollmentController = require('../controllers/enrollmentController');
const { protect } = require('../middleware/authMiddleware');
const restrictTo = require('../middleware/roleMiddleware');
const ROLES = require('../constants/roles');

// Public / Authenticated Course Browsing
router.use(protect);

router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourseById);

// Course Materials (Requires enrollment or ownership, enforced by DB RLS)
router.get('/:id/materials', courseController.getCourseMaterials);

// Enrollments
router.post('/enroll', restrictTo(ROLES.STUDENT), enrollmentController.enroll);
router.get('/enrollments/me', restrictTo(ROLES.STUDENT), enrollmentController.getMyEnrollments);
router.delete('/:id/unenroll', restrictTo(ROLES.STUDENT), enrollmentController.unenroll);

// Teacher / Admin Only routes
router.use(restrictTo(ROLES.TEACHER, ROLES.ADMIN));

router.post('/', courseController.createCourse);
router.put('/:id', courseController.updateCourse);
router.delete('/:id', courseController.deleteCourse);

// Teacher Materials management
router.post('/:id/materials', courseController.addCourseMaterial);
router.delete('/:id/materials/:materialId', courseController.deleteCourseMaterial);

module.exports = router;
