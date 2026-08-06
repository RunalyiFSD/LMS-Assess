const NotImplementedError = require('../errors/NotImplementedError');

class CodingEvaluationService {
  static async evaluateCodeQuality(code, language, problemStatement) {
    throw new NotImplementedError('Coding evaluation is not yet implemented.');
  }
}

module.exports = CodingEvaluationService;
