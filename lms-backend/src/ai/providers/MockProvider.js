const BaseProvider = require('./BaseProvider');

/**
 * Mock Provider for CI/CD and Local Testing
 * Simulates LLM responses without network calls or costs.
 */
class MockProvider extends BaseProvider {
  constructor(config) {
    super(config);
  }

  async generate(prompt, options = {}) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 50));
    
    return {
      text: 'This is a mocked response from the AI Provider for testing purposes.',
      usage: {
        promptTokens: Math.floor(prompt.length / 4), // Rough approximation
        completionTokens: 15,
        totalTokens: Math.floor(prompt.length / 4) + 15
      }
    };
  }

  async generateJson(prompt, schema, options = {}) {
    await new Promise(resolve => setTimeout(resolve, 50));
    
    return {
      data: { _mocked: true, message: 'Mock JSON response' },
      usage: {
        promptTokens: Math.floor(prompt.length / 4),
        completionTokens: 15,
        totalTokens: Math.floor(prompt.length / 4) + 15
      }
    };
  }
}

module.exports = MockProvider;
