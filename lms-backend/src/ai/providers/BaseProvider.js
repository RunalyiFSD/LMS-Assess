const NotImplementedError = require('../errors/NotImplementedError');

/**
 * Base AI Provider Interface
 * All specific providers (Gemini, OpenAI) must extend this class and implement its methods.
 */
class BaseProvider {
  constructor(config) {
    this.config = config;
  }

  /**
   * Generate a response from the LLM.
   * @param {string} prompt - The compiled prompt string
   * @param {Object} options - { model, temperature, maxTokens, systemInstruction }
   * @returns {Promise<Object>} - { text, usage: { promptTokens, completionTokens, totalTokens } }
   */
  async generate(prompt, options = {}) {
    throw new NotImplementedError('generate method must be implemented by the provider');
  }

  /**
   * Generate a response structured as JSON from the LLM.
   * @param {string} prompt - The compiled prompt string
   * @param {Object} schema - The expected JSON schema
   * @param {Object} options - { model, temperature, maxTokens, systemInstruction }
   * @returns {Promise<Object>} - { data, usage: { promptTokens, completionTokens, totalTokens } }
   */
  async generateJson(prompt, schema, options = {}) {
    throw new NotImplementedError('generateJson method must be implemented by the provider');
  }
}

module.exports = BaseProvider;
