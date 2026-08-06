const AIError = require('./AIError');

/**
 * Not Implemented Error
 * Thrown when an AI service or provider feature is called but hasn't been implemented yet.
 */
class NotImplementedError extends AIError {
  constructor(message = 'This AI feature is not yet implemented.') {
    super(message);
  }
}

module.exports = NotImplementedError;
