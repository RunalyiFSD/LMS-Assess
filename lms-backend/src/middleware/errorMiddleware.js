const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data: ${errors.join('. ')}`;
  return new AppError(message, 400);
};

module.exports = (err, req, res, next) => {
  let error = err;

  if (err.name === 'CastError') error = handleCastErrorDB(err);
  if (err.code === 11000) error = handleDuplicateFieldsDB(err); // Mongo duplicate key
  if (err.name === 'ValidationError') error = handleValidationErrorDB(err);

  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';

  // Log error via Winston with structured metadata
  logger.error(error.message || 'Unhandled Express Error', {
    requestId: req.id,
    url: req.originalUrl,
    method: req.method,
    statusCode: error.statusCode,
    userId: req.user ? req.user._id : undefined,
    stack: error.stack,
  });

  if (process.env.NODE_ENV === 'development') {
    res.status(error.statusCode).json({
      status: error.status,
      error: error,
      message: error.message,
      stack: error.stack,
    });
  } else {
    // Production Mode: Send operational, user-friendly messages
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message || 'Something went wrong on the server',
    });
  }
};
