const BaseProvider = require('./BaseProvider');

class OpenAIProvider extends BaseProvider {
  constructor(config) {
    super(config);
    // No SDK initialization yet (Phase 1)
  }

  async generate(prompt, options = {}) {
    // Return a dummy response for now
    return {
      text: 'OpenAIProvider: Not implemented yet',
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

module.exports = OpenAIProvider;
