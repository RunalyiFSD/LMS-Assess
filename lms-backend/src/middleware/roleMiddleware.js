const AppError = require('../utils/AppError');

exports.authorize = (...roles) => {
  return (req, res, next) => {
    // Check if the user's role is permitted
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError(`Access Denied: You do not have permission to perform this action. Required: [${roles.join(', ')}]`, 403)
      );
    }
    next();
  };
};
