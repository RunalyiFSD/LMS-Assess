const HTTP_STATUS = require('../constants/httpStatus');

/**
 * Standardized success response formatter.
 *
 * @param {Object} res - Express response object
 * @param {any} data - Payload data to return
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code (default: 200)
 */
exports.sendSuccess = (res, data = null, message = 'Success', statusCode = HTTP_STATUS.OK) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Standardized error response formatter.
 *
 * @param {Object} res - Express response object
 * @param {string} message - Primary error message
 * @param {any} errors - Detailed validation/execution errors
 * @param {number} statusCode - HTTP status code (default: 500)
 */
exports.sendError = (res, message = 'Internal Server Error', errors = null, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR) => {
  const response = {
    success: false,
    message,
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};
