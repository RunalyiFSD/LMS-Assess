const PROVIDERS = require('../constants/providers');
const MODELS = require('../constants/models');
const LIMITS = require('../constants/limits');

/**
 * AI Configuration Layer
 * Parses and validates environment variables into a frozen configuration object.
 */
const aiConfig = {
  enabled: process.env.AI_ENABLED === 'true',
  
  // Default provider and models
  defaultProvider: process.env.AI_DEFAULT_PROVIDER || PROVIDERS.GEMINI,
  models: {
    evaluation: process.env.AI_EVALUATION_MODEL || MODELS.GEMINI_PRO,
    generation: process.env.AI_GENERATION_MODEL || MODELS.GEMINI_FLASH,
    tutor: process.env.AI_TUTOR_MODEL || MODELS.GEMINI_FLASH,
  },

  // API Keys (accessed via getters so they aren't logged easily, and to prevent crashes if disabled)
  keys: {
    get gemini() {
      return process.env.GEMINI_API_KEY || null;
    },
    get openai() {
      return process.env.OPENAI_API_KEY || null;
    },
    get groq() {
      return process.env.GROQ_API_KEY || null;
    }
  },

  // Global thresholds
  timeoutMs: parseInt(process.env.AI_TIMEOUT_MS, 10) || LIMITS.DEFAULT_TIMEOUT_MS,
  maxRetries: parseInt(process.env.AI_MAX_RETRIES, 10) || LIMITS.MAX_RETRIES,
  dailyBudgetUsd: parseFloat(process.env.AI_DAILY_BUDGET_USD) || 5.00,
  
  // Check if AI is fully configured and ready to be used
  get isConfigured() {
    if (!this.enabled) return false;
    
    // Check if the default provider has a corresponding key
    if (this.defaultProvider === PROVIDERS.GEMINI && !this.keys.gemini) return false;
    if (this.defaultProvider === PROVIDERS.OPENAI && !this.keys.openai) return false;
    if (this.defaultProvider === PROVIDERS.GROQ && !this.keys.groq) return false;
    
    return true;
  }
};

module.exports = Object.freeze(aiConfig);
