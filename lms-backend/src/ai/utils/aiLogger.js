const logger = require('../../utils/logger');

/**
 * AI Logger Strategy Interface
 */
class ConsoleAILogger {
  async log(data) {
    const level = data.success ? 'info' : 'error';
    const tag = `[AI Telemetry] [${data.feature || 'unknown'}] [${data.questionType || 'general'}]`;
    const summary = `${tag} status=${data.success ? 'SUCCESS' : 'FAILED'} provider=${data.provider}/${data.model} duration=${data.durationMs}ms retries=${data.retryCount || 0} tokens=${data.totalTokens || 0} cost=$${(data.estimatedCostUsd || 0).toFixed(6)}${data.errorCategory ? ' errorCategory=' + data.errorCategory : ''}`;

    if (data.success) {
      logger.info(summary, {
        prompt: data.prompt,
        telemetry: {
          durationMs: data.durationMs,
          tokensIn: data.tokensIn,
          tokensOut: data.tokensOut,
          totalTokens: data.totalTokens,
          estimatedCostUsd: data.estimatedCostUsd
        }
      });
    } else {
      logger.error(summary, {
        prompt: data.prompt,
        errorCategory: data.errorCategory,
        errorMessage: data.errorMessage,
        telemetry: {
          durationMs: data.durationMs,
          retryCount: data.retryCount
        }
      });
    }
  }
}

/**
 * Standardized Telemetry Logging for all AI calls.
 */
class AILogger {
  static _logger = new ConsoleAILogger(); 

  static setLoggerStrategy(loggerInstance) {
    this._logger = loggerInstance;
  }

  /**
   * Log an AI API call with duration, cost, prompt metadata, and error categorization.
   * Non-blocking: will not throw if logger fails.
   * @param {Object} data
   */
  static async logCall(data) {
    try {
      // Estimated pricing for standard LLM tiers ($0.0001 per 1k input tokens, $0.0002 per 1k output tokens)
      const tokensIn = data.tokensIn || 0;
      const tokensOut = data.tokensOut || 0;
      const estimatedCostUsd = ((tokensIn / 1000) * 0.0001) + ((tokensOut / 1000) * 0.0002);

      const logEntry = {
        timestamp: new Date().toISOString(),
        feature: data.feature || 'general',
        questionType: data.questionType || 'general',
        provider: data.provider || 'unknown',
        model: data.model || 'unknown',
        prompt: data.prompt || { name: 'unknown', version: '1.0.0', hash: 'none' },
        durationMs: data.durationMs || 0,
        retryCount: data.retryCount || 0,
        tokensIn,
        tokensOut,
        totalTokens: data.totalTokens || (tokensIn + tokensOut),
        estimatedCostUsd,
        success: data.success === true,
        errorCategory: data.errorCategory || null,
        errorMessage: data.errorMessage || null,
        validationErrors: data.validationErrors || []
      };

      await this._logger.log(logEntry);
    } catch (loggingError) {
      // Telemetry should never crash the main request
      console.error('[AILogger] Logging failed:', loggingError.message);
    }
  }
}

module.exports = AILogger;
