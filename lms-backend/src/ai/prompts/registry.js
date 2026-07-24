const fs = require('fs');
const path = require('path');

/**
 * Prompt Registry
 * Loads prompt templates from disk and compiles them with variables.
 * In a future phase, this could be backed by a database or caching layer.
 */
class PromptRegistry {
  /**
   * Load a prompt template from the registry.
   * @param {string} domain - e.g., 'evaluation', 'question'
   * @param {string} promptName - e.g., 'theory_grading', 'mcq_generator'
   * @returns {string} - The raw template string
   */
  static loadTemplate(domain, promptName) {
    const filePath = path.join(__dirname, domain, `${promptName}.txt`);
    try {
      return fs.readFileSync(filePath, 'utf-8');
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`Prompt template not found: ${domain}/${promptName}`);
      }
      throw error;
    }
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
      console.warn(`[PromptRegistry] Unreplaced variables found in ${domain}/${promptName}:`, unreplacedMatches);
    }

    return template;
  }
}

module.exports = PromptRegistry;
