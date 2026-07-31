const NotImplementedError = require('../errors/NotImplementedError');

class AssessmentBuilderService {
  static async buildAssessmentFromTopic(topic, duration, marks, questionDistribution) {
    throw new NotImplementedError('Assessment generation is not yet implemented.');
  }
}

module.exports = AssessmentBuilderService;
