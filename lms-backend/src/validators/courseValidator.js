// Simple validator for now, will throw if failed
const { sendError } = require('../helpers/apiResponse');
const HTTP_STATUS = require('../constants/httpStatus');

exports.validateCourseCreate = (req, res, next) => {
  const { title } = req.body;
  if (!title) {
    return sendError(res, 'Title is required', null, HTTP_STATUS.BAD_REQUEST);
  }
  next();
};
