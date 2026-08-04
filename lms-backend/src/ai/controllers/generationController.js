const GenerationService = require('../services/generationService');
const ProviderFactory = require('../providers/ProviderFactory');
const aiConfig = require('../config/aiConfig');

/**
 * Controller for handling AI Generation endpoints
 */
class GenerationController {
  
  static async healthCheck(req, res) {
    const startTime = Date.now();
    const providerName = aiConfig.defaultProvider || 'groq';
    let modelName = aiConfig.models.generation;
    
    if (providerName === 'groq') {
      modelName = 'llama-3.1-8b-instant';
    }

    let providerStats = {
      retries: 0,
      failures: 0,
      lastSuccess: null,
      lastLatencyMs: 0
    };

    let authStatus = 'valid';
    try {
      const provider = ProviderFactory.getProvider();
      if (typeof provider.getMetrics === 'function') {
        providerStats = provider.getMetrics();
      }
    } catch (e) {
      authStatus = 'unconfigured_or_invalid';
    }

    const checkLatencyMs = Date.now() - startTime;

    res.status(200).json({
      status: 'healthy',
      provider: providerName,
      model: modelName,
      configured: aiConfig.isConfigured,
      authentication: authStatus,
      latencyMs: checkLatencyMs,
      retries: providerStats.retries || 0,
      failures: providerStats.failures || 0,
      lastSuccess: providerStats.lastSuccess || new Date().toISOString()
    });
  }
  
  static async generateQuestions(req, res, next) {
    try {
      const { topic, type, difficulty, count } = req.body;

      if (!topic || !type || !difficulty || count === undefined) {
        return res.status(400).json({
          status: 'fail',
          errorCode: 'ERR_INVALID_REQUEST',
          message: 'Missing required parameters: topic, type, difficulty, count',
        });
      }

      const parsedCount = parseInt(count, 10);
      if (isNaN(parsedCount) || parsedCount < 1 || parsedCount > 10) {
        return res.status(400).json({
          status: 'fail',
          errorCode: 'ERR_INVALID_COUNT',
          message: 'Count must be an integer between 1 and 10',
        });
      }

      if (!['mcq', 'coding', 'theory'].includes(type)) {
        return res.status(400).json({
          status: 'fail',
          errorCode: 'ERR_INVALID_TYPE',
          message: "Invalid type. Must be 'mcq', 'coding', or 'theory'",
        });
      }

      const result = await GenerationService.generateQuestions(topic, type, difficulty, parsedCount);

      res.status(200).json({
        status: 'success',
        data: result
      });
    } catch (error) {
      const errorMessage = error.message || 'An unexpected error occurred during question generation';
      let statusCode = error.statusCode || 500;
      let errorCode = 'ERR_UNEXPECTED';

      if (errorMessage.startsWith('ERR_')) {
        const parts = errorMessage.split(':');
        errorCode = parts[0].trim();
        if (errorCode === 'ERR_JSON_PARSE' || errorCode === 'ERR_RAW_SCHEMA_INVALID') {
          statusCode = 502;
        } else if (errorCode === 'ERR_PROVIDER_RATE_LIMIT') {
          statusCode = 429;
        } else if (errorCode === 'ERR_PROVIDER_TIMEOUT') {
          statusCode = 504;
        }
      }

      res.status(statusCode).json({
        status: 'error',
        errorCode,
        message: errorMessage
      });
    }
  }
}

module.exports = GenerationController;
