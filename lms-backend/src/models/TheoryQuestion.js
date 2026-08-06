const mongoose = require('mongoose');

const theoryQuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, 'Question is required'],
      trim: true,
    },
    maxMarks: {
      type: Number,
      required: [true, 'Max marks are required'],
      min: [1, 'Max marks must be at least 1'],
    },
    suggestedAnswer: {
      type: String,
      trim: true,
      default: '',
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // ─── Optional fields added for parity with MCQQuestion / CodingQuestion ───
    // These are NOT required; existing documents without them are fully backward compatible.
    difficulty: {
      type: String,
      enum: ['easy', 'moderate', 'difficult'],
      default: undefined, // omit from document when not set
    },
    topic: {
      type: String,
      trim: true,
      default: '',
    },
    // rubric: structured grading instructions used by the AI evaluation service
    rubric: {
      type: String,
      trim: true,
      default: '',
    },
    // keywords: key concepts the evaluator should look for in the student's answer
    keywords: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for subject lookups and author queries
theoryQuestionSchema.index({ subject: 1 });
theoryQuestionSchema.index({ createdBy: 1 });
// New: support difficulty-based filtering in the question bank (sparse so null docs are excluded)
theoryQuestionSchema.index({ subject: 1, difficulty: 1 }, { sparse: true });

module.exports = mongoose.model('TheoryQuestion', theoryQuestionSchema);
