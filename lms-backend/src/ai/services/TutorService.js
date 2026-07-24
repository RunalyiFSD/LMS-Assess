const NotImplementedError = require('../errors/NotImplementedError');

class TutorService {
  static async generateHint(question, studentCurrentAnswer, currentHintLevel) {
    throw new NotImplementedError('Hint generation is not yet implemented.');
  }

  static async chatWithTutor(sessionId, studentMessage, context) {
    throw new NotImplementedError('Tutor chat is not yet implemented.');
  }
}

module.exports = TutorService;
