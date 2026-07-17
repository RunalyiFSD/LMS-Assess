const assessmentService = require('../services/assessmentService');
const { sendSuccess, sendError } = require('../helpers/apiResponse');
const HTTP_STATUS = require('../constants/httpStatus');

exports.getQuestionsByAssessment = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const questions = await assessmentService.getQuestions(assessmentId);
    return sendSuccess(res, questions, 'Questions fetched successfully');
  } catch (error) {
    return sendError(res, error.message, null, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

exports.createQuestion = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const { type, content, marks, order, options } = req.body;

    if (!type || !content) {
      return sendError(res, 'Question type and content are required', null, HTTP_STATUS.BAD_REQUEST);
    }

    const question = await assessmentService.addQuestion(
      assessmentId,
      { type, content, marks, order },
      options, // array of {text, is_correct}
      req.user.id,
      req.user.role
    );

    return sendSuccess(res, question, 'Question added successfully', HTTP_STATUS.CREATED);
  } catch (error) {
    return sendError(res, error.message, null, HTTP_STATUS.BAD_REQUEST);
  }
};

exports.updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { assessmentId, content, marks, order } = req.body;

    if (!assessmentId) {
      return sendError(res, 'assessmentId is required in body to verify ownership', null, HTTP_STATUS.BAD_REQUEST);
    }

    const updated = await assessmentService.updateQuestion(id, assessmentId, {
      content, marks, order
    }, req.user.id, req.user.role);

    return sendSuccess(res, updated, 'Question updated successfully');
  } catch (error) {
    return sendError(res, error.message, null, HTTP_STATUS.BAD_REQUEST);
  }
};

exports.deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { assessmentId } = req.query; // pass via query string

    if (!assessmentId) {
      return sendError(res, 'assessmentId query parameter is required', null, HTTP_STATUS.BAD_REQUEST);
    }

    await assessmentService.deleteQuestion(id, assessmentId, req.user.id, req.user.role);
    return sendSuccess(res, null, 'Question deleted successfully');
  } catch (error) {
    return sendError(res, error.message, null, HTTP_STATUS.BAD_REQUEST);
  }
};
