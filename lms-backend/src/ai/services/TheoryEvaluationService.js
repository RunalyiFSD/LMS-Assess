const NotImplementedError = require('../errors/NotImplementedError');

class TheoryEvaluationService {
  static async evaluateAnswer(questionText, studentAnswer, rubric) {
    throw new NotImplementedError('Theory evaluation is not yet implemented.');
  }
}

module.exports = TheoryEvaluationService;
