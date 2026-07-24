const logger = require('../../utils/logger');

/**
 * AI Logger
 * Standardized logging for all AI interactions.
 * In Phase 2, this will also write to the MongoDB AIUsageMetrics collection.
 */
class AILogger {
  /**
   * Log an AI API call.
   * @param {Object} data
   * @param {string} data.feature - e.g., 'theory_evaluation' (from FEATURES constant)
   * @param {string} data.provider - e.g., 'gemini'
   * @param {string} data.model - e.g., 'gemini-1.5-pro'
   * @param {number} data.latencyMs - Response time in milliseconds
   * @param {number} data.tokensIn - Number of prompt tokens
   * @param {number} data.tokensOut - Number of completion tokens
   * @param {boolean} data.success - Whether the call succeeded
   * @param {string} [data.error] - Error message if it failed
   * @param {string} [data.userId] - Optional user ID who triggered it
   */
  static async logCall(data) {
    // Estimate cost (very rough generic estimate for logging purposes)
    // In production, this would use a rate card per provider/model.
    const estimatedCostUsd = (data.tokensIn * 0.0001) + (data.tokensOut * 0.0002);

    const logEntry = {
      ...data,
      estimatedCostUsd,
      timestamp: new Date().toISOString(),
    };

    if (data.success) {
      logger.info(`[AI Usage] [${data.feature}] success`, logEntry);
    } else {
      logger.error(`[AI Usage] [${data.feature}] failure`, logEntry);
    }

    // TODO (Phase 2): Write to AIUsageMetrics MongoDB collection here
  }
}

module.exports = AILogger;
