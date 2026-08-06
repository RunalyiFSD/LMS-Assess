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
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log error via Winston with structured metadata
  logger.error(err.message || 'Unhandled Express Error', {
    requestId: req.id,
    url: req.originalUrl,
    method: req.method,
    statusCode: err.statusCode,
    userId: req.user ? req.user._id : undefined,
    stack: err.stack,
  });

  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    // Production Mode: Send operational, user-friendly messages
    let error = { ...err };
    error.message = err.message;

    if (err.name === 'CastError') error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDuplicateFieldsDB(err); // Mongo duplicate key
    if (err.name === 'ValidationError') error = handleValidationErrorDB(error);

    res.status(error.statusCode || 500).json({
      status: error.status || 'error',
      message: error.message || 'Something went wrong on the server',
    });
  }
};
