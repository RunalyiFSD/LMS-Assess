const NotImplementedError = require('../errors/NotImplementedError');

class CareerService {
  static async generateCareerInsights(studentProfile, assessmentResults) {
    throw new NotImplementedError('Career insights generation is not yet implemented.');
  }

  static async generateLearningPath(studentWeaknesses) {
    throw new NotImplementedError('Learning path generation is not yet implemented.');
  }
}

module.exports = CareerService;
