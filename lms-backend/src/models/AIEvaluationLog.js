const mongoose = require('mongoose');

const aiEvaluationLogSchema = new mongoose.Schema(
  {
    attemptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Attempt',
      required: true,
      index: true,
    },
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    provider: {
      type: String,
      required: true,
    },
    modelName: {
      type: String,
      required: true,
    },
    promptHash: {
      type: String,
      // Used to detect if the prompt template changed since this evaluation
    },
    rawAiResponse: {
      type: String, // Store the raw JSON or text output from the LLM for auditing
      required: true,
    },
    parsedResult: {
      marks: Number,
      feedback: String,
      confidenceScore: Number,
    },
    tokensUsed: {
      input: Number,
      output: Number,
      total: Number,
    },
    processingTimeMs: {
      type: Number,
    },
    needsHumanReview: {
      type: Boolean,
      default: false, // Set to true if confidence is low or error occurred
    },
  },
  {
    timestamps: true,
  }
);

// Helps find all evaluations for a specific attempt quickly
aiEvaluationLogSchema.index({ attemptId: 1, questionId: 1 });

module.exports = mongoose.model('AIEvaluationLog', aiEvaluationLogSchema);
