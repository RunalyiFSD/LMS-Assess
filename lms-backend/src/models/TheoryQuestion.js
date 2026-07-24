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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('TheoryQuestion', theoryQuestionSchema);
