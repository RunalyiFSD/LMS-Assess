const mongoose = require('mongoose');

const codingQuestionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Problem title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Problem description is required'],
      trim: true,
    },
    constraints: {
      type: String,
      trim: true,
      default: '',
    },
    sampleInput: {
      type: String,
      trim: true,
      default: '',
    },
    sampleOutput: {
      type: String,
      trim: true,
      default: '',
    },
    testCases: [
      {
        input: {
          type: String,
          required: true,
        },
        expectedOutput: {
          type: String,
          required: true,
        },
        isSample: {
          type: Boolean,
          default: false,
        },
      },
    ],
    templates: [
      {
        language: {
          type: String,
          enum: ['javascript', 'python', 'cpp', 'java'],
          required: true,
        },
        starterCode: {
          type: String,
          required: true,
        },
      },
    ],
    timeLimit: {
      type: Number, // In milliseconds
      default: 2000,
    },
    memoryLimit: {
      type: Number, // In MB
      default: 256,
    },
    marks: {
      type: Number,
      required: [true, 'Question marks are required'],
      min: [1, 'Marks must be at least 1'],
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

module.exports = mongoose.model('CodingQuestion', codingQuestionSchema);
