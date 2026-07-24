const BaseProvider = require('./BaseProvider');

class GeminiProvider extends BaseProvider {
  constructor(config) {
    super(config);
    // No SDK initialization yet (Phase 1)
  }

  async generate(prompt, options = {}) {
    // Return a dummy response for now
    return {
      text: 'GeminiProvider: Not implemented yet',
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 }
    };
  }

  async generateJson(prompt, schema, options = {}) {
    return {
      data: {},
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 }
    };
  }
}

module.exports = GeminiProvider;
