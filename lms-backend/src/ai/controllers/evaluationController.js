const EvaluationService = require('../services/evaluationService');

class EvaluationController {

  static async evaluateMCQ(req, res, next) {
    try {
      const { question, correct_answer, student_answer } = req.body;
      if (!question || !correct_answer || !student_answer) {
        return res.status(400).json({ status: 'fail', message: 'Missing parameters: question, correct_answer, student_answer' });
      }
      const result = await EvaluationService.evaluateMCQ(question, correct_answer, student_answer);
      res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      res.status(error.statusCode || 500).json({ status: 'error', message: error.message });
    }
  }

  static async evaluateCoding(req, res, next) {
    try {
      const { problem_statement, student_code } = req.body;
      if (!problem_statement || !student_code) {
        return res.status(400).json({ status: 'fail', message: 'Missing parameters: problem_statement, student_code' });
      }
      const result = await EvaluationService.evaluateCoding(problem_statement, student_code);
      res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      res.status(error.statusCode || 500).json({ status: 'error', message: error.message });
    }
  }

  static async evaluateTheory(req, res, next) {
    try {
      const { question, rubric, student_answer } = req.body;
      if (!question || !rubric || !student_answer) {
        return res.status(400).json({ status: 'fail', message: 'Missing parameters: question, rubric, student_answer' });
      }
      const result = await EvaluationService.evaluateTheory(question, rubric, student_answer);
      res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      res.status(error.statusCode || 500).json({ status: 'error', message: error.message });
    }
  }
}

module.exports = EvaluationController;
