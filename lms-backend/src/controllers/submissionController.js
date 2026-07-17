const evaluationService = require('../services/evaluationService');
const submissionRepository = require('../repositories/submissionRepository');
const { sendSuccess, sendError } = require('../helpers/apiResponse');
const HTTP_STATUS = require('../constants/httpStatus');

exports.startSubmission = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { assessmentId } = req.body;

    if (!assessmentId) {
      return sendError(res, 'Assessment ID is required', null, HTTP_STATUS.BAD_REQUEST);
    }

    const submission = await evaluationService.startSubmission(assessmentId, studentId);
    return sendSuccess(res, submission, 'Submission started', HTTP_STATUS.CREATED);
  } catch (error) {
    return sendError(res, error.message, null, HTTP_STATUS.BAD_REQUEST);
  }
};

exports.saveAnswers = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { id: submissionId } = req.params;
    const { answers } = req.body; // Array of answer objects

    if (!answers || !Array.isArray(answers)) {
      return sendError(res, 'Answers array is required', null, HTTP_STATUS.BAD_REQUEST);
    }

    const result = await evaluationService.saveAnswers(submissionId, studentId, answers);
    return sendSuccess(res, result, 'Answers saved successfully');
  } catch (error) {
    return sendError(res, error.message, null, HTTP_STATUS.BAD_REQUEST);
  }
};

exports.submitFinal = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { id: submissionId } = req.params;
    const { answers } = req.body; // Final state before submit

    const result = await evaluationService.submitAssessment(submissionId, studentId, answers);
    return sendSuccess(res, result, 'Assessment submitted successfully');
  } catch (error) {
    return sendError(res, error.message, null, HTTP_STATUS.BAD_REQUEST);
  }
};

exports.getSubmissionsForAssessment = async (req, res) => {
  try {
    // Teacher endpoint
    const { assessmentId } = req.params;
    const submissions = await submissionRepository.findByAssessment(assessmentId);
    return sendSuccess(res, submissions, 'Submissions fetched successfully');
  } catch (error) {
    return sendError(res, error.message, null, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

exports.gradeSubmission = async (req, res) => {
  try {
    // Teacher endpoint
    const teacherId = req.user.id;
    const { id: submissionId } = req.params;
    const { updates } = req.body; // Array of {question_id, marks_awarded, feedback}

    if (!updates || !Array.isArray(updates)) {
      return sendError(res, 'Updates array is required', null, HTTP_STATUS.BAD_REQUEST);
    }

    const result = await evaluationService.gradeSubmission(submissionId, teacherId, req.user.role, updates);
    return sendSuccess(res, result, 'Grading saved successfully');
  } catch (error) {
    return sendError(res, error.message, null, HTTP_STATUS.BAD_REQUEST);
  }
};
