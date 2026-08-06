const Groq = require('groq-sdk');
const BaseProvider = require('./BaseProvider');
const AIProviderError = require('../errors/AIProviderError');

class GroqProvider extends BaseProvider {
  constructor(config) {
    super(config);
    if (!config.keys.groq) {
      throw new Error('Groq API key is missing');
    }
    this.groq = new Groq({ apiKey: config.keys.groq });
  }

  async generate(prompt, options = {}) {
    try {
      const model = options.model || 'llama-3.1-8b-instant'; // Default fallback if not in config
      
      const messages = [];
      if (options.systemInstruction) {
        messages.push({ role: 'system', content: options.systemInstruction });
      }
      messages.push({ role: 'user', content: prompt });

      const response = await this.groq.chat.completions.create({
        messages,
        model,
        temperature: options.temperature ?? 0.7,
      });

      return {
        text: response.choices[0]?.message?.content || '',
        usage: {
          promptTokens: response.usage?.prompt_tokens || 0,
          completionTokens: response.usage?.completion_tokens || 0,
          totalTokens: response.usage?.total_tokens || 0
        }
      };
    } catch (error) {
      throw new AIProviderError(`Groq generation failed: ${error.message}`, 'groq', error.status || 500);
    }
  }

  async generateJson(prompt, schema, options = {}) {
    try {
      const model = options.model || 'llama-3.1-8b-instant';
      
      const messages = [];
      if (options.systemInstruction) {
        messages.push({ role: 'system', content: options.systemInstruction });
      }
      // Groq requires the word JSON in the prompt for json_object mode
      messages.push({ role: 'user', content: `${prompt}\n\nPlease respond in JSON format.` });

      const response = await this.groq.chat.completions.create({
        messages,
        model,
        temperature: options.temperature ?? 0.1,
        response_format: { type: 'json_object' }
      });

      const text = response.choices[0]?.message?.content || '{}';
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error('Failed to parse JSON response from Groq');
      }

      return {
        data,
        usage: {
          promptTokens: response.usage?.prompt_tokens || 0,
          completionTokens: response.usage?.completion_tokens || 0,
          totalTokens: response.usage?.total_tokens || 0
        }
      };
    } catch (error) {
      throw new AIProviderError(`Groq JSON generation failed: ${error.message}`, 'groq', error.status || 500);
    }
  }
}

module.exports = GroqProvider;
