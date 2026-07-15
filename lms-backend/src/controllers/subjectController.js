const Subject = require('../models/Subject');
const AppError = require('../utils/AppError');

// @desc    Get all subjects
// @route   GET /api/subjects
// @access  Protected
exports.getAllSubjects = async (req, res, next) => {
  try {
    const subjects = await Subject.find().populate('createdBy', 'name email');
    res.status(200).json({
      status: 'success',
      results: subjects.length,
      data: {
        subjects,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create Subject
// @route   POST /api/subjects
// @access  Admin, Instructor
exports.createSubject = async (req, res, next) => {
  try {
    const { name, code, description } = req.body;

    const codeExists = await Subject.findOne({ code: code.toUpperCase() });
    if (codeExists) {
      return next(new AppError('Subject with this code already exists', 400));
    }

    const subject = await Subject.create({
      name,
      code: code.toUpperCase(),
      description,
      createdBy: req.user._id,
    });

    res.status(201).json({
      status: 'success',
      data: {
        subject,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Subject Details
// @route   GET /api/subjects/:id
// @access  Protected
exports.getSubjectDetails = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id).populate('createdBy', 'name email');
    if (!subject) {
      return next(new AppError('Subject not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        subject,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Subject
// @route   PUT /api/subjects/:id
// @access  Admin
exports.updateSubject = async (req, res, next) => {
  try {
    const { name, code, description } = req.body;

    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return next(new AppError('Subject not found', 404));
    }

    if (code) {
      const codeExists = await Subject.findOne({ code: code.toUpperCase(), _id: { $ne: subject._id } });
      if (codeExists) {
        return next(new AppError('Subject code is already in use', 400));
      }
      subject.code = code.toUpperCase();
    }

    if (name) subject.name = name;
    if (description) subject.description = description;

    await subject.save();

    res.status(200).json({
      status: 'success',
      data: {
        subject,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Subject
// @route   DELETE /api/subjects/:id
// @access  Admin
exports.deleteSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findByIdAndDelete(req.params.id);
    if (!subject) {
      return next(new AppError('Subject not found', 404));
    }

    res.status(200).json({
      status: 'success',
      message: 'Subject deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
