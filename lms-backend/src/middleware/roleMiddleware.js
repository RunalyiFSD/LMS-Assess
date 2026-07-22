const AppError = require('../utils/AppError');

/**
 * Role-based authorization middleware factory.
 *
 * Usage in routes:
 *   const { authorize } = require('../middleware/roleMiddleware');
 *   router.use(authorize('admin', 'teacher'));
 *
 * Also compatible with default import:
 *   const restrictTo = require('../middleware/roleMiddleware');
 *   router.use(restrictTo('student'));
 */
const authorize = (...roles) => {
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

// Export as default callable (for routes using `const restrictTo = require(...)`)
// AND as named export (for files using `const { authorize } = require(...)`)
module.exports = authorize;
module.exports.authorize = authorize;
