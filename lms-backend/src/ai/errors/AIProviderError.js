const AIError = require('./AIError');

/**
 * Provider Error
 * Thrown when the underlying LLM provider API returns an error (e.g., 500, 503).
 */
class AIProviderError extends AIError {
  constructor(message, provider, statusCode = 500) {
    super(message);
    this.provider = provider;
    this.statusCode = statusCode;
  }
}

module.exports = AIProviderError;
