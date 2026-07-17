const courseService = require('../services/courseService');
const { sendSuccess, sendError } = require('../helpers/apiResponse');
const HTTP_STATUS = require('../constants/httpStatus');

exports.getAllCourses = async (req, res) => {
  try {
    const { status, department_id } = req.query;
    
    // Non-admins and non-teachers should only see published courses usually, 
    // but RLS enforces that automatically.
    const filters = {};
    if (status) filters.status = status;
    if (department_id) filters.department_id = department_id;
    
    const courses = await courseService.getAllCourses(filters);
    return sendSuccess(res, courses, 'Courses fetched successfully');
  } catch (error) {
    return sendError(res, error.message, null, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const course = await courseService.getCourseById(req.params.id);
    if (!course) {
      return sendError(res, 'Course not found', null, HTTP_STATUS.NOT_FOUND);
    }
    return sendSuccess(res, course, 'Course details fetched successfully');
  } catch (error) {
    return sendError(res, error.message, null, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

exports.createCourse = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { title, description, department_id, thumbnail_url } = req.body;
    
    const course = await courseService.createCourse(teacherId, {
      title,
      description,
      department_id,
      thumbnail_url
    });
    
    return sendSuccess(res, course, 'Course created successfully', HTTP_STATUS.CREATED);
  } catch (error) {
    return sendError(res, error.message, null, HTTP_STATUS.BAD_REQUEST);
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, department_id, status, thumbnail_url } = req.body;
    
    const updated = await courseService.updateCourse(id, req.user.id, req.user.role, {
      title, description, department_id, status, thumbnail_url
    });
    
    return sendSuccess(res, updated, 'Course updated successfully');
  } catch (error) {
    return sendError(res, error.message, null, HTTP_STATUS.BAD_REQUEST);
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    await courseService.deleteCourse(req.params.id, req.user.id, req.user.role);
    return sendSuccess(res, null, 'Course archived successfully');
  } catch (error) {
    return sendError(res, error.message, null, HTTP_STATUS.BAD_REQUEST);
  }
};

exports.getCourseMaterials = async (req, res) => {
  try {
    const materials = await courseService.getCourseMaterials(req.params.id, req.user.id, req.user.role);
    return sendSuccess(res, materials, 'Materials fetched successfully');
  } catch (error) {
    return sendError(res, error.message, null, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

exports.addCourseMaterial = async (req, res) => {
  try {
    const { title, type, url, order } = req.body;
    const material = await courseService.addCourseMaterial(
      req.params.id,
      { title, type, url, order },
      req.user.id,
      req.user.role
    );
    return sendSuccess(res, material, 'Material added successfully', HTTP_STATUS.CREATED);
  } catch (error) {
    return sendError(res, error.message, null, HTTP_STATUS.BAD_REQUEST);
  }
};

exports.deleteCourseMaterial = async (req, res) => {
  try {
    const { id: courseId, materialId } = req.params;
    await courseService.deleteCourseMaterial(materialId, courseId, req.user.id, req.user.role);
    return sendSuccess(res, null, 'Material deleted successfully');
  } catch (error) {
    return sendError(res, error.message, null, HTTP_STATUS.BAD_REQUEST);
  }
};
