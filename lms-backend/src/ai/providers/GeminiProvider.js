const { GoogleGenAI } = require('@google/genai');
const BaseProvider = require('./BaseProvider');
const AIProviderError = require('../errors/AIProviderError');
const JsonExtractor = require('../utils/jsonExtractor');

class GeminiProvider extends BaseProvider {
  constructor(config) {
    super(config);
    if (!config.keys.gemini) {
      throw new Error('Gemini API key is missing');
    }
    this.ai = new GoogleGenAI({ apiKey: config.keys.gemini });
    this.stats = {
      totalRequests: 0,
      retries: 0,
      failures: 0,
      lastSuccess: null,
      lastLatencyMs: 0
    };
  }

  async _executeWithRetry(operationFn, maxRetries = 3, initialDelayMs = 500) {
    let lastError;
    let delay = initialDelayMs;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const startTime = Date.now();
        const result = await operationFn();
        this.stats.lastLatencyMs = Date.now() - startTime;
        this.stats.lastSuccess = new Date().toISOString();
        this.stats.totalRequests++;
        return { result, retryCount: attempt, latencyMs: this.stats.lastLatencyMs };
      } catch (error) {
        lastError = error;
        const status = error.status || error.statusCode || 500;
        const isRetryable = status === 429 || status === 500 || status === 502 || status === 503 || error.code === 'ETIMEDOUT';

        if (attempt < maxRetries && isRetryable) {
          this.stats.retries++;
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= 2;
        } else {
          break;
        }
      }
    }

    this.stats.failures++;
    throw lastError;
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

      const { result, retryCount, latencyMs } = await this._executeWithRetry(async () => {
        return await this.ai.models.generateContent({
          model,
          contents: prompt,
          config
        });
      }, options.maxRetries ?? 3);

      return {
        text: result.text,
        usage: {
          promptTokens: result.usageMetadata?.promptTokenCount || 0,
          completionTokens: result.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: result.usageMetadata?.totalTokenCount || 0
        },
        telemetry: {
          retryCount,
          latencyMs,
          model
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
        temperature: options.temperature ?? 0.1,
        responseMimeType: 'application/json',
      };
      
      if (schema) {
        config.responseSchema = schema;
      }

      if (options.systemInstruction) {
        config.systemInstruction = options.systemInstruction;
      }

      const { result, retryCount, latencyMs } = await this._executeWithRetry(async () => {
        return await this.ai.models.generateContent({
          model,
          contents: prompt,
          config
        });
      }, options.maxRetries ?? 3);

      const rawText = result.text || '{}';
      const data = JsonExtractor.extractAndParse(rawText);

      return {
        data,
        usage: {
          promptTokens: result.usageMetadata?.promptTokenCount || 0,
          completionTokens: result.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: result.usageMetadata?.totalTokenCount || 0
        },
        telemetry: {
          retryCount,
          latencyMs,
          model
        }
      };
    } catch (error) {
      throw new AIProviderError(`Gemini JSON generation failed: ${error.message}`, 'gemini', error.status || 500);
    }
  }

  getMetrics() {
    return {
      provider: 'gemini',
      ...this.stats
    };
  }
}

module.exports = GeminiProvider;
