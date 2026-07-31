const fs = require('fs');
const path = require('path');
const PromptError = require('../errors/PromptError');

/**
 * Prompt Registry
 * Loads prompt templates from disk, caches them, and compiles them with variables.
 */
class PromptRegistry {
  static #cache = new Map();

  /**
   * Load a prompt template from the registry (with caching).
   * @param {string} domain - e.g., 'evaluation', 'question'
   * @param {string} promptName - e.g., 'theory_grading', 'mcq_generator'
   * @returns {string} - The raw template string
   */
  static loadTemplate(domain, promptName) {
    const cacheKey = `${domain}/${promptName}`;
    
    if (this.#cache.has(cacheKey)) {
      return this.#cache.get(cacheKey);
    }

    const filePath = path.join(__dirname, domain, `${promptName}.txt`);
    try {
      const template = fs.readFileSync(filePath, 'utf-8');
      this.#cache.set(cacheKey, template);
      return template;
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new PromptError(`Prompt template not found: ${domain}/${promptName}`, domain, promptName);
      }
      throw error;
    }
  }

  /**
   * Clears the in-memory prompt cache. Useful for testing or hot-reloading.
   */
  static clearCache() {
    this.#cache.clear();
  }

  /**
   * Load and compile a prompt template with the given variables.
   * @param {string} domain - The prompt domain folder
   * @param {string} promptName - The prompt filename (without .txt)
   * @param {Object} variables - Key-value pairs to replace in the template
   * @returns {string} - The compiled prompt string
   */
  static getPrompt(domain, promptName, variables = {}) {
    let template = this.loadTemplate(domain, promptName);

    // Replace {{variableName}} with actual values
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      template = template.replace(regex, value);
    }

    // Check if any {{...}} remain unreplaced
    const unreplacedMatches = template.match(/{{.*?}}/g);
    if (unreplacedMatches) {
      const errorMsg = `Unreplaced variables found in ${domain}/${promptName}: ${unreplacedMatches.join(', ')}`;
      if (process.env.NODE_ENV !== 'production') {
        throw new PromptError(errorMsg, domain, promptName);
      } else {
        console.warn(`[PromptRegistry] ${errorMsg}`);
      }
    }

    return template;
  }
}

module.exports = PromptRegistry;
