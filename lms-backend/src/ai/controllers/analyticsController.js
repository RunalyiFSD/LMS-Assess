const AnalyticsService = require('../services/analyticsService');

class AnalyticsController {
  
  static async analyzeWeakTopics(req, res, next) {
    try {
      const { evaluations } = req.body;
      if (!evaluations) {
        return res.status(400).json({ status: 'fail', message: 'Missing parameters: evaluations' });
      }
      const result = await AnalyticsService.analyzeWeakTopics(evaluations);
      res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      res.status(error.statusCode || 500).json({ status: 'error', message: error.message });
    }
  }

  static async generateRecommendations(req, res, next) {
    try {
      const { weak_topics } = req.body;
      if (!weak_topics) {
        return res.status(400).json({ status: 'fail', message: 'Missing parameters: weak_topics' });
      }
      const result = await AnalyticsService.generateRecommendations(weak_topics);
      res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      res.status(error.statusCode || 500).json({ status: 'error', message: error.message });
    }
  }

  static async getStudentMetrics(req, res, next) {
    try {
      const { student_data } = req.body;
      if (!student_data) {
        return res.status(400).json({ status: 'fail', message: 'Missing parameters: student_data' });
      }
      const result = await AnalyticsService.getStudentMetrics(student_data);
      res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      res.status(error.statusCode || 500).json({ status: 'error', message: error.message });
    }
  }

  static async getInstructorMetrics(req, res, next) {
    try {
      const { class_data } = req.body;
      if (!class_data) {
        return res.status(400).json({ status: 'fail', message: 'Missing parameters: class_data' });
      }
      const result = await AnalyticsService.getInstructorMetrics(class_data);
      res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      res.status(error.statusCode || 500).json({ status: 'error', message: error.message });
    }
  }
}

module.exports = AnalyticsController;
