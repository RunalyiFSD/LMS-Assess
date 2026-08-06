const Groq = require('groq-sdk');
const BaseProvider = require('./BaseProvider');
const AIProviderError = require('../errors/AIProviderError');
const JsonExtractor = require('../utils/jsonExtractor');

class GroqProvider extends BaseProvider {
  constructor(config) {
    super(config);
    if (!config.keys.groq) {
      throw new Error('Groq API key is missing');
    }
    this.groq = new Groq({ apiKey: config.keys.groq });
    this.stats = {
      totalRequests: 0,
      retries: 0,
      failures: 0,
      lastSuccess: null,
      lastLatencyMs: 0
    };
  }

  /**
   * Internal helper to execute API calls with exponential backoff retry.
   */
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
          delay *= 2; // Exponential backoff
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
      const model = options.model || 'llama-3.1-8b-instant';
      const messages = [];
      
      if (options.systemInstruction) {
        messages.push({ role: 'system', content: options.systemInstruction });
      }
      messages.push({ role: 'user', content: prompt });

      const { result, retryCount, latencyMs } = await this._executeWithRetry(async () => {
        return await this.groq.chat.completions.create({
          messages,
          model,
          temperature: options.temperature ?? 0.7,
        });
      }, options.maxRetries ?? 3);

      return {
        text: result.choices[0]?.message?.content || '',
        usage: {
          promptTokens: result.usage?.prompt_tokens || 0,
          completionTokens: result.usage?.completion_tokens || 0,
          totalTokens: result.usage?.total_tokens || 0
        },
        telemetry: {
          retryCount,
          latencyMs,
          model
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
      messages.push({ role: 'user', content: `${prompt}\n\nPlease respond strictly in JSON format.` });

      const { result, retryCount, latencyMs } = await this._executeWithRetry(async () => {
        return await this.groq.chat.completions.create({
          messages,
          model,
          temperature: options.temperature ?? 0.1,
          response_format: { type: 'json_object' }
        });
      }, options.maxRetries ?? 3);

      const rawText = result.choices[0]?.message?.content || '{}';
      const data = JsonExtractor.extractAndParse(rawText);

      return {
        data,
        usage: {
          promptTokens: result.usage?.prompt_tokens || 0,
          completionTokens: result.usage?.completion_tokens || 0,
          totalTokens: result.usage?.total_tokens || 0
        },
        telemetry: {
          retryCount,
          latencyMs,
          model
        }
      };
    } catch (error) {
      throw new AIProviderError(`Groq JSON generation failed: ${error.message}`, 'groq', error.status || 500);
    }
  }

  getMetrics() {
    return {
      provider: 'groq',
      ...this.stats
    };
  }
}

module.exports = GroqProvider;
