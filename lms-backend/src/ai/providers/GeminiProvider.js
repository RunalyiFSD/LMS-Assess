const { GoogleGenAI } = require('@google/genai');
const BaseProvider = require('./BaseProvider');
const AIProviderError = require('../errors/AIProviderError');

class GeminiProvider extends BaseProvider {
  constructor(config) {
    super(config);
    if (!config.keys.gemini) {
      throw new Error('Gemini API key is missing');
    }
    this.ai = new GoogleGenAI({ apiKey: config.keys.gemini });
  }

  async generate(prompt, options = {}) {
    try {
      const model = options.model || this.config.models.generation;
      
      const config = {
        temperature: options.temperature ?? 0.7,
      };
      
      if (options.systemInstruction) {
        config.systemInstruction = options.systemInstruction;
      }

      const response = await this.ai.models.generateContent({
        model,
        contents: prompt,
        config
      });

      return {
        text: response.text,
        usage: {
          promptTokens: response.usageMetadata?.promptTokenCount || 0,
          completionTokens: response.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: response.usageMetadata?.totalTokenCount || 0
        }
      };
    } catch (error) {
      throw new AIProviderError(`Gemini generation failed: ${error.message}`, 'gemini', error.status || 500);
    }
  }

  async generateJson(prompt, schema, options = {}) {
    try {
      const model = options.model || this.config.models.generation;
      
      const config = {
        temperature: options.temperature ?? 0.1, // Lower temperature for JSON
        responseMimeType: 'application/json',
      };
      
      if (schema) {
        config.responseSchema = schema;
      }

      if (options.systemInstruction) {
        config.systemInstruction = options.systemInstruction;
      }

      const response = await this.ai.models.generateContent({
        model,
        contents: prompt,
        config
      });

      let data;
      try {
        data = JSON.parse(response.text);
      } catch (e) {
        throw new Error('Failed to parse JSON response from Gemini');
      }

      return {
        data,
        usage: {
          promptTokens: response.usageMetadata?.promptTokenCount || 0,
          completionTokens: response.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: response.usageMetadata?.totalTokenCount || 0
        }
      };
    } catch (error) {
      throw new AIProviderError(`Gemini JSON generation failed: ${error.message}`, 'gemini', error.status || 500);
    }
  }
}

module.exports = GeminiProvider;
