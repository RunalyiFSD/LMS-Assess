/**
 * @deprecated DO NOT USE.
 * This service is deprecated and will be removed in Sprint 3.2.
 * All evaluation features must use `evaluationService.js`.
 */
const NotImplementedError = require('../errors/NotImplementedError');

class TheoryEvaluationService {
  static async evaluateAnswer(questionText, studentAnswer, rubric) {
    throw new NotImplementedError('Theory evaluation is not yet implemented.');
  }
}

module.exports = TheoryEvaluationService;

