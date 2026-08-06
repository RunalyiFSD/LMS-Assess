const logger = require('../../utils/logger');
// const AIUsageMetrics = require('../../models/AIUsageMetrics'); // Future implementation

/**
 * AI Logger Strategy Interface
 */
class ConsoleAILogger {
  async log(data) {
    if (data.success) {
      logger.info(`[AI Usage] [${data.feature}] success`, data);
    } else {
      logger.error(`[AI Usage] [${data.feature}] failure`, data);
    }
  }
}

class MongoAILogger {
  async log(data) {
    // TODO (Future Sprint): Write to AIUsageMetrics MongoDB collection here
    // Example: await AIUsageMetrics.create({...data});
  }
}

/**
 * AI Logger Context
 * Standardized logging for all AI interactions.
 */
class AILogger {
  // Default to Console Logger for architecture phase
  static _logger = new ConsoleAILogger(); 

  static setLoggerStrategy(loggerInstance) {
    this._logger = loggerInstance;
  }

  /**
   * Log an AI API call.
   * @param {Object} data
   */
  static async logCall(data) {
    const estimatedCostUsd = ((data.tokensIn || 0) * 0.0001) + ((data.tokensOut || 0) * 0.0002);
    const logEntry = {
      ...data,
      estimatedCostUsd,
      timestamp: new Date().toISOString(),
    };

    await this._logger.log(logEntry);
  }
}

module.exports = AILogger;
