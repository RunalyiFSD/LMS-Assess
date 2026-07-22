const AppError = require('../utils/AppError');

// Validates request body using a Joi schema
exports.validateBody = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false, allowUnknown: true });
    if (error) {
      const errorDetails = error.details.map((detail) => detail.message).join(', ');
      return next(new AppError(`Validation Error: ${errorDetails}`, 400));
    }
    next();
  };
};
