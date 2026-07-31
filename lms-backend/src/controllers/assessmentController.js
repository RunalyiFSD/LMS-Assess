const Assessment = require('../models/Assessment');
const MCQQuestion = require('../models/MCQQuestion');
const CodingQuestion = require('../models/CodingQuestion');
const TheoryQuestion = require('../models/TheoryQuestion');
const AppError = require('../utils/AppError');

// @desc    Create Assessment
// @route   POST /api/assessments
// @access  Instructor, Admin
exports.createAssessment = async (req, res, next) => {
  try {
    const { title, description, subject, type, duration, passingScore, totalMarks, questions, dueDate, scheduledAt } = req.body;

    const assessment = await Assessment.create({
      title,
      description,
      subject,
      type,
      duration,
      passingScore,
      totalMarks,
      questions: questions || [],
      creator: req.user._id,
      dueDate,
      scheduledAt,
    });

    res.status(201).json({
      status: 'success',
      data: {
        assessment,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get All Assessments
// @route   GET /api/assessments
// @access  Protected (Students, Instructors, Admins)
exports.getAllAssessments = async (req, res, next) => {
  try {
    const { subject, type, isActive, isMock } = req.query;
    const filter = {};

    if (subject) filter.subject = subject;
    if (type) filter.type = type;

    // Filter by mock status
    if (isMock === 'true') {
      return res.status(200).json({
        status: 'success',
        results: 0,
        data: {
          assessments: [],
        },
      });
    } else {
      filter.isMock = { $ne: true };
    }
    
    // Students should only see active assessments unless they are searching completed ones
    if (req.user.role === 'student') {
      filter.isActive = true;
    } else if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const assessments = await Assessment.find(filter)
      .populate('subject', 'name code')
      .populate('creator', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: assessments.length,
      data: {
        assessments,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Assessment Details (Securely sanitized for students)
// @route   GET /api/assessments/:id
// @access  Protected
exports.getAssessmentDetails = async (req, res, next) => {
  try {
    const assessment = await Assessment.findById(req.params.id)
      .populate('subject', 'name code')
      .populate('questions.questionId');

    if (!assessment) {
      return next(new AppError('Assessment not found', 404));
    }

    if (assessment.isMock && req.user.role !== 'student') {
      return next(new AppError('Only students are allowed to access mock assessments', 403));
    }

    // Convert to JSON object for manipulation
    const assessmentObj = assessment.toObject();

    // Secure answers and testcases from students to prevent cheating
    if (req.user.role === 'student') {
      if (!assessmentObj.isActive) {
        return next(new AppError('This assessment is not active/published yet.', 403));
      }

      assessmentObj.questions = assessmentObj.questions.map((qRef) => {
        const question = qRef.questionId;
        if (!question) return qRef;

        // Strip correct MCQ choices
        if (qRef.questionModel === 'MCQQuestion') {
          delete question.correctAnswerIndex;
        }
        // Strip hidden coding test cases, only expose public samples
        else if (qRef.questionModel === 'CodingQuestion') {
          if (question.testCases) {
            question.testCases = question.testCases.filter((tc) => tc.isSample === true);
          }
        }
        // Strip suggested theory solutions
        else if (qRef.questionModel === 'TheoryQuestion') {
          delete question.suggestedAnswer;
        }

        return qRef;
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        assessment: assessmentObj,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Assessment
// @route   PUT /api/assessments/:id
// @access  Instructor, Admin
exports.updateAssessment = async (req, res, next) => {
  try {
    const assessment = await Assessment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!assessment) {
      return next(new AppError('Assessment not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        assessment,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Assessment
// @route   DELETE /api/assessments/:id
// @access  Instructor, Admin
exports.deleteAssessment = async (req, res, next) => {
  try {
    const assessment = await Assessment.findByIdAndDelete(req.params.id);
    if (!assessment) {
      return next(new AppError('Assessment not found', 404));
    }

    res.status(200).json({
      status: 'success',
      message: 'Assessment deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Calendar Scheduled Assessments
// @route   GET /api/assessments/calendar
// @access  Protected
exports.getCalendarEvents = async (req, res, next) => {
  try {
    const filter = {};
    if (req.user.role === 'student') {
      filter.isActive = true;
    }

    const assessments = await Assessment.find(filter)
      .populate('subject', 'name code')
      .populate('creator', 'name email')
      .sort({ scheduledAt: 1, createdAt: -1 });

    const now = new Date();
    const events = assessments.map((ast) => {
      const startTime = ast.scheduledAt ? new Date(ast.scheduledAt) : new Date(ast.createdAt);
      let endTime = ast.dueDate ? new Date(ast.dueDate) : new Date(startTime.getTime() + (ast.duration || 60) * 60000);

      let status = 'upcoming';
      if (now >= startTime && now <= endTime) {
        status = 'active';
      } else if (now > endTime) {
        status = 'closed';
      }

      // Map category tag (Quiz, Test, Assignment, Exam)
      let category = 'Assignment';
      const titleLower = (ast.title || '').toLowerCase();
      if (titleLower.includes('quiz')) category = 'Quiz';
      else if (titleLower.includes('exam') || titleLower.includes('final') || titleLower.includes('midterm')) category = 'Exam';
      else if (titleLower.includes('test')) category = 'Test';
      else if (ast.type === 'coding') category = 'Test';
      else if (ast.type === 'mcq') category = 'Quiz';

      return {
        id: ast._id,
        title: ast.title,
        description: ast.description,
        subject: ast.subject,
        type: ast.type,
        category,
        duration: ast.duration,
        totalMarks: ast.totalMarks,
        passingScore: ast.passingScore,
        startTime,
        endTime,
        status,
        isActive: ast.isActive,
        creator: ast.creator,
      };
    });

    res.status(200).json({
      status: 'success',
      results: events.length,
      data: {
        events,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create Calendar Scheduled Event
// @route   POST /api/assessments/calendar
// @access  Instructor, Admin
exports.createCalendarEvent = async (req, res, next) => {
  try {
    const { title, description, subject, type, duration, passingScore, totalMarks, scheduledAt, dueDate, category } = req.body;

    const finalTitle = category ? `${title}` : title;

    const assessment = await Assessment.create({
      title: finalTitle,
      description: description || '',
      subject,
      type: type || 'mcq',
      duration: duration || 60,
      passingScore: passingScore || 40,
      totalMarks: totalMarks || 100,
      creator: req.user._id,
      isActive: true,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(),
      dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + (duration || 60) * 60000),
    });

    res.status(201).json({
      status: 'success',
      data: {
        assessment,
      },
    });
  } catch (error) {
    next(error);
  }
};

