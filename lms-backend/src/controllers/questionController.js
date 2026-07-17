const MCQQuestion = require('../legacy/models/MCQQuestion');
const CodingQuestion = require('../legacy/models/CodingQuestion');
const TheoryQuestion = require('../legacy/models/TheoryQuestion');
const AppError = require('../utils/AppError');

// Helper to map type string to actual Mongoose model
const getModelByType = (type) => {
  if (type === 'mcq') return MCQQuestion;
  if (type === 'coding') return CodingQuestion;
  if (type === 'theory') return TheoryQuestion;
  return null;
};

// @desc    Add Question to Bank
// @route   POST /api/questions/:type
// @access  Instructor, Admin
exports.createQuestion = async (req, res, next) => {
  try {
    const { type } = req.params;
    const Model = getModelByType(type);
    if (!Model) {
      return next(new AppError('Invalid question type parameter. Use [mcq, coding, theory]', 400));
    }

    const questionData = {
      ...req.body,
      createdBy: req.user._id,
    };

    const question = await Model.create(questionData);

    res.status(201).json({
      status: 'success',
      data: {
        question,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all questions from the banks (mixed or filtered)
// @route   GET /api/questions
// @access  Instructor, Admin
exports.getAllQuestions = async (req, res, next) => {
  try {
    const { subject, difficulty, topic, type } = req.query;
    let questions = [];

    // Filter queries
    const queryObj = {};
    if (subject) queryObj.subject = subject;
    if (difficulty) queryObj.difficulty = difficulty;
    if (topic) queryObj.topic = topic;

    if (type) {
      const Model = getModelByType(type);
      if (!Model) {
        return next(new AppError('Invalid question type filter. Use [mcq, coding, theory]', 400));
      }
      questions = await Model.find(queryObj).populate('subject', 'name code').populate('createdBy', 'name');
    } else {
      // Return combination of all types if no type requested
      const mcqs = await MCQQuestion.find(queryObj).populate('subject', 'name code').populate('createdBy', 'name');
      const coding = await CodingQuestion.find(queryObj).populate('subject', 'name code').populate('createdBy', 'name');
      const theory = await TheoryQuestion.find(queryObj).populate('subject', 'name code').populate('createdBy', 'name');

      questions = [
        ...mcqs.map(q => ({ ...q.toObject(), type: 'mcq' })),
        ...coding.map(q => ({ ...q.toObject(), type: 'coding' })),
        ...theory.map(q => ({ ...q.toObject(), type: 'theory' }))
      ];
    }

    res.status(200).json({
      status: 'success',
      results: questions.length,
      data: {
        questions,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get question details
// @route   GET /api/questions/:type/:id
// @access  Instructor, Admin
exports.getQuestionDetails = async (req, res, next) => {
  try {
    const { type, id } = req.params;
    const Model = getModelByType(type);
    if (!Model) {
      return next(new AppError('Invalid question type', 400));
    }

    const question = await Model.findById(id).populate('subject', 'name code');
    if (!question) {
      return next(new AppError('Question not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        question,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Question
// @route   PUT /api/questions/:type/:id
// @access  Instructor, Admin
exports.updateQuestion = async (req, res, next) => {
  try {
    const { type, id } = req.params;
    const Model = getModelByType(type);
    if (!Model) {
      return next(new AppError('Invalid question type', 400));
    }

    const question = await Model.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!question) {
      return next(new AppError('Question not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        question,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Question
// @route   DELETE /api/questions/:type/:id
// @access  Instructor, Admin
exports.deleteQuestion = async (req, res, next) => {
  try {
    const { type, id } = req.params;
    const Model = getModelByType(type);
    if (!Model) {
      return next(new AppError('Invalid question type', 400));
    }

    const question = await Model.findByIdAndDelete(id);
    if (!question) {
      return next(new AppError('Question not found', 404));
    }

    res.status(200).json({
      status: 'success',
      message: 'Question deleted successfully from bank',
    });
  } catch (error) {
    next(error);
  }
};
