const AppError = require('../utils/AppError');

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

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

    res.status(error.statusCode || 500).json({
      status: error.status || 'error',
      message: error.message || 'Something went wrong on the server',
    });
  }
};
