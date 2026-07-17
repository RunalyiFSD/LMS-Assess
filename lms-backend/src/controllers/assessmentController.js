const assessmentService = require('../services/assessmentService');
const { sendSuccess, sendError } = require('../helpers/apiResponse');
const HTTP_STATUS = require('../constants/httpStatus');

exports.getAllAssessments = async (req, res) => {
  try {
    const { course_id, status } = req.query;
    const filters = {};
    if (course_id) filters.course_id = course_id;
    if (status) filters.status = status;

    const assessments = await assessmentService.getAllAssessments(filters, req.user.id, req.user.role);
    return sendSuccess(res, assessments, 'Assessments fetched successfully');
  } catch (error) {
    return sendError(res, error.message, null, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

exports.getAssessmentDetails = async (req, res) => {
  try {
    const assessment = await assessmentService.getAssessmentById(req.params.id);
    if (!assessment) {
      return sendError(res, 'Assessment not found', null, HTTP_STATUS.NOT_FOUND);
    }
    return sendSuccess(res, assessment, 'Assessment details fetched successfully');
  } catch (error) {
    return sendError(res, error.message, null, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

exports.createAssessment = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { course_id, title, type, duration, status, max_score, instructions } = req.body;
    
    if (!course_id || !title) {
      return sendError(res, 'Course ID and Title are required', null, HTTP_STATUS.BAD_REQUEST);
    }

    const assessment = await assessmentService.createAssessment({
      course_id, title, type, duration, status, max_score, instructions
    }, teacherId, req.user.role);
    
    return sendSuccess(res, assessment, 'Assessment created successfully', HTTP_STATUS.CREATED);
  } catch (error) {
    return sendError(res, error.message, null, HTTP_STATUS.BAD_REQUEST);
  }
};

exports.updateAssessment = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, type, duration, status, max_score, instructions } = req.body;
    
    const updated = await assessmentService.updateAssessment(id, {
      title, type, duration, status, max_score, instructions
    }, req.user.id, req.user.role);
    
    return sendSuccess(res, updated, 'Assessment updated successfully');
  } catch (error) {
    return sendError(res, error.message, null, HTTP_STATUS.BAD_REQUEST);
  }
};

exports.deleteAssessment = async (req, res) => {
  try {
    await assessmentService.deleteAssessment(req.params.id, req.user.id, req.user.role);
    return sendSuccess(res, null, 'Assessment deleted successfully');
  } catch (error) {
    return sendError(res, error.message, null, HTTP_STATUS.BAD_REQUEST);
  }
};
