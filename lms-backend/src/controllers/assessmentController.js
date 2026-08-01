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

// @desc    Assign Assessment from Question Bank to Students
// @route   POST /api/assessments/assign
// @access  Instructor, Admin
// @desc    Assign Assessment from Question Bank to Students
// @route   POST /api/assessments/assign
// @access  Instructor, Admin
exports.assignAssessment = async (req, res, next) => {
  try {
    const Notification = require('../models/Notification');
    const Subject = require('../models/Subject');
    const {
      title,
      description,
      subject,
      type = 'mcq',
      duration = 60,
      passingScore = 40,
      totalMarks = 100,
      questions = [],
      dueDate,
      assignmentType = 'all',
      assignedBatch = null,
      assignedStudents = [],
    } = req.body;

    const calcDueDate = dueDate ? new Date(dueDate) : new Date(Date.now() + (duration || 60) * 60 * 1000);

    let targetSubjectId = null;
    if (subject && typeof subject === 'object' && subject._id) {
      targetSubjectId = subject._id;
    } else if (subject && typeof subject === 'string' && subject.length === 24) {
      targetSubjectId = subject;
    }

    if (!targetSubjectId) {
      const defaultSub = await Subject.findOne();
      if (defaultSub) {
        targetSubjectId = defaultSub._id;
      }
    }

    const sanitizedQuestions = (questions || []).map((q) => {
      let qId = q.questionId || q._id;
      if (qId && typeof qId === 'object' && qId._id) qId = qId._id;
      if (!qId || typeof qId !== 'string' || qId.length !== 24) {
        qId = '6584c8a2b39f112e34567890';
      }
      return {
        questionId: qId,
        questionModel: q.questionModel || (type === 'coding' ? 'CodingQuestion' : type === 'theory' ? 'TheoryQuestion' : 'MCQQuestion'),
      };
    });

    const assessment = await Assessment.create({
      title: title || 'Assigned Assessment',
      description: description || '',
      subject: targetSubjectId,
      type,
      duration,
      passingScore,
      totalMarks,
      questions: sanitizedQuestions,
      creator: req.user._id,
      isActive: true,
      dueDate: calcDueDate,
      assignmentType,
      assignedBatch,
      assignedStudents,
    });

    // Create notifications for assigned students
    if (assignedStudents && assignedStudents.length > 0) {
      const notifications = assignedStudents.map((studentId) => ({
        recipient: studentId,
        sender: req.user._id,
        title: 'New Assessment Assigned',
        message: `You have been assigned a new assessment: "${assessment.title}". Due by ${calcDueDate.toLocaleDateString()}.`,
        type: 'assessment_assigned',
      }));
      await Notification.insertMany(notifications).catch((err) =>
        console.warn('Failed to send assignment notifications:', err)
      );
    }

    res.status(201).json({
      status: 'success',
      message: 'Assessment assigned successfully',
      data: {
        assessment,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Assessments Assigned to Currently Logged-in Student
// @route   GET /api/assessments/assigned-to-me
// @access  Student
exports.getAssignedToMe = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const userBatch = req.user.batch;

    const filter = {
      isActive: true,
      $or: [
        { assignmentType: 'all' },
        { assignmentType: { $exists: false } },
        { assignmentType: null },
        { assignedStudents: userId },
        { assignedStudents: String(userId) },
      ],
    };

    if (userBatch) {
      filter.$or.push({ assignedBatch: userBatch });
    }

    const assessments = await Assessment.find(filter)
      .populate('subject', 'name code')
      .populate('creator', 'name email')
      .sort({ createdAt: -1, dueDate: 1 });

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

// @desc    Get All Assessments Created by Logged-in Instructor
// @route   GET /api/assessments/my-created
// @access  Instructor, Admin
exports.getMyCreatedAssessments = async (req, res, next) => {
  try {
    const filter = {};
    if (req.user.role !== 'admin') {
      filter.creator = req.user._id;
    }

    let assessments = await Assessment.find(filter)
      .populate('subject', 'name code')
      .populate('creator', 'name email')
      .sort({ createdAt: -1 });

    // Fallback: If no assessments are filtered specifically by creator ObjectId, return all active non-mock assessments
    if (assessments.length === 0) {
      assessments = await Assessment.find({ isMock: { $ne: true } })
        .populate('subject', 'name code')
        .populate('creator', 'name email')
        .sort({ createdAt: -1 });
    }

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

// @desc    Update Assessment Dates (DueDate, ScheduledAt)
// @route   PUT /api/assessments/:id/dates
// @access  Instructor, Admin
exports.updateAssessmentDates = async (req, res, next) => {
  try {
    const { dueDate, scheduledAt } = req.body;
    const updateData = {};

    if (dueDate) updateData.dueDate = new Date(dueDate);
    if (scheduledAt) updateData.scheduledAt = new Date(scheduledAt);

    const assessment = await Assessment.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate('subject', 'name code');

    if (!assessment) {
      return next(new AppError('Assessment not found', 404));
    }

    res.status(200).json({
      status: 'success',
      message: 'Assessment dates updated successfully',
      data: {
        assessment,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear / Delete All Assigned Assessments (Non-Mock)
// @route   DELETE /api/assessments/clear-all
// @access  Instructor, Admin
exports.clearAllAssigned = async (req, res, next) => {
  try {
    const result = await Assessment.deleteMany({ isMock: { $ne: true } });
    res.status(200).json({
      status: 'success',
      message: `Cleared all ${result.deletedCount} assigned assessments`,
      data: {
        deletedCount: result.deletedCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

