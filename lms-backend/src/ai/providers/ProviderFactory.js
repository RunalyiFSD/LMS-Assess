const PROVIDERS = require('../constants/providers');
const GeminiProvider = require('./GeminiProvider');
const OpenAIProvider = require('./OpenAIProvider');
const GroqProvider = require('./GroqProvider');
const MockProvider = require('./MockProvider');
const aiConfig = require('../config/aiConfig');

/**
 * Provider Factory
 * Returns the appropriate provider instance based on configuration.
 */
class ProviderFactory {
  /**
   * Get an instance of the requested provider.
   * @param {string} [providerName] - Optional provider name. Defaults to the configured default provider.
   * @returns {BaseProvider}
   */
  static getProvider(providerName = aiConfig.defaultProvider) {
    if (!aiConfig.isConfigured) {
      throw new Error('AI Module is not configured or is disabled.');
    }

    switch (providerName) {
      case PROVIDERS.GEMINI:
        return new GeminiProvider(aiConfig);
      case PROVIDERS.OPENAI:
        return new OpenAIProvider(aiConfig);
      case PROVIDERS.GROQ:
        return new GroqProvider(aiConfig);
      case PROVIDERS.MOCK:
        return new MockProvider(aiConfig);
      default:
        throw new Error(`Unsupported AI provider: ${providerName}`);
    }
  }
}

module.exports = ProviderFactory;
