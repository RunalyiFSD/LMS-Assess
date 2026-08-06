/**
 * @deprecated DO NOT USE.
 * This service is deprecated and will be removed in Sprint 3.2.
 * All generation features must use `generationService.js`.
 */
const NotImplementedError = require('../errors/NotImplementedError');

class QuestionGenerationService {
  static async generateMCQ(topic, difficulty, count) {
    throw new NotImplementedError('MCQ generation is not yet implemented.');
  }

  static async generateCodingQuestion(topic, difficulty) {
    throw new NotImplementedError('Coding question generation is not yet implemented.');
  }
}

module.exports = QuestionGenerationService;

