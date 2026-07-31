/**
 * Environment Variable Validator
 *
 * Purpose:
 *   Validates that all required environment variables are present and secure
 *   before the server starts. Prevents silent misconfiguration.
 *
 * Responsibilities:
 *   - Verify required vars are not empty
 *   - Warn (dev) or crash (prod) on insecure defaults
 *   - Declare AI-related vars (optional, not required unless AI_ENABLED=true)
 *
 * Future extension points:
 *   - Add AI_ENABLED check when AI features are activated
 *   - Add OPENAI_API_KEY / ANTHROPIC_API_KEY to required list when needed
 *
 * Dependencies:
 *   - None (uses only process.env)
 *
 * Usage:
 *   const { validateEnv } = require('./config/env');
 *   validateEnv(); // Call before anything else in server.js
 */

const INSECURE_JWT_DEFAULT = 'super_secret_lms_assessment_key_123!';

const REQUIRED_VARS = [
  'MONGO_URI',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'NODE_ENV',
];

/**
 * Validates environment variables at server startup.
 * Throws in production for critical issues. Warns in development.
 */
const validateEnv = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const errors = [];
  const warnings = [];

  // 1. Check required variables are present
  for (const varName of REQUIRED_VARS) {
    if (!process.env[varName] || process.env[varName].trim() === '') {
      errors.push(`Missing required environment variable: ${varName}`);
    }
  }

  // 2. Check JWT_SECRET is not using the insecure default
  if (process.env.JWT_SECRET === INSECURE_JWT_DEFAULT) {
    const msg =
      'JWT_SECRET is using the insecure default value. ' +
      'Set a strong, unique secret in your .env file.';
    if (isProduction) {
      errors.push(msg);
    } else {
      warnings.push(msg);
    }
  }

  // 3. Check JWT_SECRET minimum length (must be at least 32 characters)
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32 && process.env.JWT_SECRET !== INSECURE_JWT_DEFAULT) {
    warnings.push(
      `JWT_SECRET is shorter than 32 characters (current: ${process.env.JWT_SECRET.length}). ` +
      'Use a longer secret for better security.'
    );
  }

  // 4. Validate NODE_ENV is a known value
  const validEnvs = ['development', 'production', 'test'];
  if (process.env.NODE_ENV && !validEnvs.includes(process.env.NODE_ENV)) {
    warnings.push(
      `NODE_ENV is set to an unknown value: '${process.env.NODE_ENV}'. ` +
      `Expected one of: ${validEnvs.join(', ')}`
    );
  }

  // 5. AI configuration validation (optional — only if AI_ENABLED=true)
  if (process.env.AI_ENABLED === 'true') {
    if (!process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY && !process.env.GROQ_API_KEY && !process.env.GEMINI_API_KEY) {
      errors.push(
        'AI_ENABLED=true but no LLM API key is set. ' +
        'Set OPENAI_API_KEY, ANTHROPIC_API_KEY, GROQ_API_KEY or GEMINI_API_KEY in your .env file.'
      );
    }
  }

  // Output warnings (always)
  if (warnings.length > 0) {
    console.warn('\n[ENV WARNING] Environment configuration warnings:');
    warnings.forEach((w) => console.warn(`  ⚠  ${w}`));
    console.warn('');
  }

  // Output errors and exit if any
  if (errors.length > 0) {
    console.error('\n[ENV ERROR] Critical environment configuration errors:');
    errors.forEach((e) => console.error(`  ✗  ${e}`));
    console.error('\nServer startup aborted. Fix the above errors in your .env file.\n');
    process.exit(1);
  }

  console.log(`[ENV] Environment validation passed (${process.env.NODE_ENV} mode)`);
};

module.exports = { validateEnv };
