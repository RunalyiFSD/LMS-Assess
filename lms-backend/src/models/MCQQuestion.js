const mongoose = require('mongoose');

const mcqQuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true,
    },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: function (val) {
          return val.length >= 4;
        },
        message: 'There must be at least 4 options',
      },
    },
    correctAnswerIndex: {
      type: Number,
      required: [true, 'Correct option index is required'],
      min: [0, 'Option index must be 0 or greater'],
      validate: {
        validator: function (val) {
          return val < this.options.length;
        },
        message: 'Correct option index must be within options range',
      },
    },
    marks: {
      type: Number,
      required: [true, 'Question marks are required'],
      min: [1, 'Marks must be at least 1'],
    },
    negativeMarks: {
      type: Number,
      default: 0,
      min: [0, 'Negative marks cannot be negative'],
      validate: {
        validator: function (val) {
          if (val > 0 && this.difficulty === 'easy') {
            return false;
          }
          return true;
        },
        message: 'Negative marking is only allowed for moderate and difficult questions',
      },
    },
    difficulty: {
      type: String,
      enum: ['easy', 'moderate', 'difficult'],
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    topic: {
      type: String,
      required: [true, 'Topic is required'],
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    companyTags: [
      {
        type: String,
        trim: true,
      },
    ],
    source: {
      type: String,
      enum: ['manual', 'ai', 'leetcode', 'company_bank'],
      default: 'manual',
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for question bank filtering and author queries
mcqQuestionSchema.index({ subject: 1, difficulty: 1 });
mcqQuestionSchema.index({ createdBy: 1 });

module.exports = mongoose.model('MCQQuestion', mcqQuestionSchema);
