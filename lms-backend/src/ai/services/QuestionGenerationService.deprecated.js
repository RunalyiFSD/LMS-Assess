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
