const AIError = require('./AIError');

/**
 * Prompt Error
 * Thrown when a prompt template is missing, fails to compile, or has unreplaced variables.
 */
class PromptError extends AIError {
  constructor(message, domain, promptName) {
    super(message);
    this.domain = domain;
    this.promptName = promptName;
  }
}

module.exports = PromptError;
