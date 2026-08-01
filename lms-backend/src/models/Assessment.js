const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Assessment title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: false,
    },
    type: {
      type: String,
      enum: ['mcq', 'coding', 'theory'],
      required: true,
    },
    duration: {
      type: Number,
      required: [true, 'Duration in minutes is required'],
      min: [1, 'Duration must be at least 1 minute'],
    },
    passingScore: {
      type: Number,
      required: [true, 'Passing score is required'],
      min: [0, 'Passing score cannot be negative'],
    },
    totalMarks: {
      type: Number,
      required: [true, 'Total marks are required'],
      min: [0, 'Total marks must be positive'],
    },
    questions: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          refPath: 'questions.questionModel',
        },
        questionModel: {
          type: String,
          required: true,
          enum: ['MCQQuestion', 'CodingQuestion', 'TheoryQuestion'],
        },
      },
    ],
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    scheduledAt: {
      type: Date,
      default: null,
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    isMock: {
      type: Boolean,
      default: false,
    },
    // --- Student & Batch Assignment Fields ---
    assignmentType: {
      type: String,
      enum: ['all', 'batch', 'students'],
      default: 'all',
    },
    assignedBatch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch',
      default: null,
    },
    assignedStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    // --- AI Integration Fields (Phase 2) ---
    aiGenerated: {
      type: Boolean,
      default: false,
    },
    hintEnabled: {
      type: Boolean,
      default: false,
    },
    hintPenaltyPercent: {
      type: Number,
      default: 0,
    },
    plagiarismCheckEnabled: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Assessment', assessmentSchema);
