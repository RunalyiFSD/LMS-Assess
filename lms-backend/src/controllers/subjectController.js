const subjectRepository = require('../repositories/subjectRepository');
const { sendSuccess, sendError } = require('../helpers/apiResponse');

exports.getAllSubjects = async (req, res) => {
  try {
    const subjects = await subjectRepository.findAll();
    sendSuccess(res, subjects, 'Subjects retrieved successfully');
  } catch (err) {
    sendError(res, err.message, null, 500);
  }
};

exports.getSubjectById = async (req, res) => {
  try {
    const subject = await subjectRepository.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({
        status: 'error',
        message: 'Subject not found'
      });
    }
    sendSuccess(res, subject, 'Subject retrieved successfully');
  } catch (err) {
    sendError(res, err.message, null, 500);
  }
};

exports.createSubject = async (req, res) => {
  try {
    const subject = await subjectRepository.create(req.body);
    sendSuccess(res, subject, 'Subject created successfully', 201);
  } catch (err) {
    sendError(res, err.message, null, 500);
  }
};

exports.deleteSubject = async (req, res) => {
  try {
    await subjectRepository.delete(req.params.id);
    sendSuccess(res, null, 'Subject deleted successfully');
  } catch (err) {
    sendError(res, err.message, null, 500);
  }
};
