/**
 * AI Limits and Default Configurations
 */

const LIMITS = {
  DEFAULT_TIMEOUT_MS: 30000,
  MAX_RETRIES: 3,
  
  // Token limits (approximate safety nets)
  MAX_INPUT_TOKENS: 100000,
  MAX_OUTPUT_TOKENS: 4096,
  
  // Temperature Defaults (0.0 = deterministic, 1.0 = creative)
  TEMP_EVALUATION: 0.1, // Grading should be strict and repeatable
  TEMP_GENERATION: 0.7, // Generating questions needs some variance
  TEMP_TUTOR: 0.5,      // Chat balance
};

module.exports = LIMITS;
