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
      // 'processing' is a transient lock state used only during the submit flow
      // to prevent duplicate concurrent submissions. The controller always
      // transitions to 'submitted' or 'graded' before sending the HTTP response.
      enum: ['started', 'processing', 'submitted', 'graded'],
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
        // --- AI Integration Fields (Phase 2 & 3) ---
        aiFeedback: {
          type: String,
          default: null, // Null means AI hasn't graded it
        },
        aiMarks: {
          type: Number,
          default: null,
        },
        aiGraded: {
          type: Boolean,
          default: false,
        },
        confidenceScore: {
          type: Number,
          default: null,
        },
        accuracy: {
          type: Number,
          default: null,
        },
        completeness: {
          type: Number,
          default: null,
        },
        terminology: {
          type: Number,
          default: null,
        },
        executionLogs: {
          type: String,
          default: null,
        },
        pendingReview: {
          type: Boolean,
          default: false, // True if AI confidence is low (< 0.60) or AI was unreachable
        },
        hintUsed: {
          type: Boolean,
          default: false,
        },
        hintLevel: {
          type: Number,
          default: null, // Track how deep into the hint tree the student went
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
attemptSchema.index({ assessment: 1, status: 1 });
attemptSchema.index({ student: 1, status: 1 });
attemptSchema.index({ status: 1, 'answers.pendingReview': 1 });

module.exports = mongoose.model('Attempt', attemptSchema);
