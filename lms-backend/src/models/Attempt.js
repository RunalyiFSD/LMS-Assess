const mongoose = require('mongoose');

const attemptSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assessment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assessment',
      required: true,
    },
    status: {
      type: String,
      enum: ['started', 'submitted', 'graded'],
      default: 'started',
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    submittedAt: {
      type: Date,
      default: null,
    },
    timeTakenSeconds: {
      type: Number,
      default: 0,
    },
    answers: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        selectedOptionIndex: {
          type: Number, // MCQ selection
          default: null,
        },
        submittedCode: {
          type: String, // Coding text
          default: '',
        },
        language: {
          type: String, // Coding language chosen
          default: '',
        },
        submittedText: {
          type: String, // Theory essay text
          default: '',
        },
        marksObtained: {
          type: Number, // Computed dynamically or assigned manually
          default: 0,
        },
        feedback: {
          type: String, // Instructor notes
          default: '',
        },
        testCasesPassedCount: {
          type: Number, // Coding test case tracking
          default: 0,
        },
      },
    ],
    totalMarksObtained: {
      type: Number,
      default: 0,
    },
    isPassed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure a student cannot have duplicate active/submitted attempts for the same assessment
attemptSchema.index({ student: 1, assessment: 1 }, { unique: true });

module.exports = mongoose.model('Attempt', attemptSchema);
