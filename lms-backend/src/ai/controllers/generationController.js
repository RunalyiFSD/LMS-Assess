const GenerationService = require('../services/generationService');

const aiConfig = require('../config/aiConfig');

/**
 * Controller for handling AI Generation endpoints
 */
class GenerationController {
  
  static async healthCheck(req, res) {
    const providerName = aiConfig.defaultProvider;
    let modelName = aiConfig.models.generation;
    
    // Ensure accurate runtime reporting if groq is the configured provider
    if (providerName === 'groq') {
      modelName = 'llama-3.1-8b-instant';
    }

    res.status(200).json({
      status: 'healthy',
      provider: providerName,
      model: modelName,
      configured: aiConfig.isConfigured
    });
  }
  
  static async generateQuestions(req, res, next) {
    try {
      const { topic, type, difficulty, count } = req.body;

      if (!topic || !type || !difficulty || !count) {
        return res.status(400).json({
          status: 'fail',
          message: 'Missing required parameters: topic, type, difficulty, count',
        });
      }

      if (!['mcq', 'coding', 'theory'].includes(type)) {
        return res.status(400).json({
          status: 'fail',
          message: "Invalid type. Must be 'mcq', 'coding', or 'theory'",
        });
      }

      const questions = await GenerationService.generateQuestions(topic, type, difficulty, count);

      res.status(200).json({
        status: 'success',
        data: questions
      });
    } catch (error) {
      // Typically, in a real express app, we pass to next(error) for global error handling.
      // For now, we will handle it locally or pass it down.
      res.status(error.statusCode || 500).json({
        status: 'error',
        message: error.message || 'An unexpected error occurred during question generation'
      });
    }
  }
}

module.exports = GenerationController;
