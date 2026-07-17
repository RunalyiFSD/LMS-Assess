const courseService = require('../services/courseService');
const { sendSuccess, sendError } = require('../helpers/apiResponse');
const HTTP_STATUS = require('../constants/httpStatus');

exports.enroll = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { courseId } = req.body;
    
    if (!courseId) {
      return sendError(res, 'Course ID is required', null, HTTP_STATUS.BAD_REQUEST);
    }
    
    const enrollment = await courseService.enrollStudent(studentId, courseId);
    return sendSuccess(res, enrollment, 'Successfully enrolled in course', HTTP_STATUS.CREATED);
  } catch (error) {
    // If uniqueness constraint is violated
    if (error.message.includes('duplicate key')) {
      return sendError(res, 'Already enrolled in this course', null, HTTP_STATUS.CONFLICT);
    }
    return sendError(res, error.message, null, HTTP_STATUS.BAD_REQUEST);
  }
};

exports.getMyEnrollments = async (req, res) => {
  try {
    const studentId = req.user.id;
    const enrollments = await courseService.getStudentEnrollments(studentId);
    return sendSuccess(res, enrollments, 'Enrollments fetched successfully');
  } catch (error) {
    return sendError(res, error.message, null, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

exports.unenroll = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { id: courseId } = req.params;
    
    await courseService.unenrollStudent(studentId, courseId);
    return sendSuccess(res, null, 'Successfully unenrolled from course');
  } catch (error) {
    return sendError(res, error.message, null, HTTP_STATUS.BAD_REQUEST);
  }
};
