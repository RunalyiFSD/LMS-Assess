const Subject = require('../models/Subject');
const AppError = require('../utils/AppError');

// @desc    Get all subjects
// @route   GET /api/subjects
// @access  Protected
exports.getAllSubjects = async (req, res, next) => {
  try {
    let subjects = await Subject.find().populate('createdBy', 'name email');

    // Auto-seed default course subjects if collection is empty
    if (subjects.length === 0) {
      const User = require('../models/User');
      const creator = (await User.findOne({ role: { $in: ['admin', 'instructor'] } })) || (await User.findOne());

      if (creator) {
        const defaultSubjects = [
          {
            name: 'Data Structures & Algorithms',
            code: 'CS-102',
            description: 'Binary trees, execution runtime constraints, sorting, search algorithms, and stack operations.',
            createdBy: creator._id,
          },
          {
            name: 'Database Management Systems',
            code: 'CS-103',
            description: 'SQL queries, relational calculus, MongoDB schemas, aggregation pipelines, and indexing.',
            createdBy: creator._id,
          },
          {
            name: 'Object-Oriented Programming',
            code: 'CS-101',
            description: 'Classes, polymorphism, inheritance, encapsulation, Java and C++ design patterns.',
            createdBy: creator._id,
          },
          {
            name: 'Web Technologies & MERN Stack',
            code: 'IT-201',
            description: 'React.js frontend state management, Node.js REST APIs, Express middleware, and MongoDB document design.',
            createdBy: creator._id,
          },
          {
            name: 'Operating Systems & System Programming',
            code: 'CS-204',
            description: 'Process scheduling, thread synchronization, memory management, virtual memory, and POSIX system calls.',
            createdBy: creator._id,
          },
          {
            name: 'Computer Networks & Security',
            code: 'IT-205',
            description: 'TCP/IP protocol stack, socket programming, OSI model, HTTP/HTTPS security, and routing algorithms.',
            createdBy: creator._id,
          },
          {
            name: 'Artificial Intelligence & Machine Learning',
            code: 'SE-301',
            description: 'Neural networks, supervised learning, model evaluation, Python machine learning frameworks.',
            createdBy: creator._id,
          },
          {
            name: 'Software Engineering & System Architecture',
            code: 'CS-305',
            description: 'Agile methodologies, UML diagrams, microservices architecture, CI/CD pipelines, and software testing.',
            createdBy: creator._id,
          },
        ];

        await Subject.insertMany(defaultSubjects);
        subjects = await Subject.find().populate('createdBy', 'name email');
      }
    }

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
