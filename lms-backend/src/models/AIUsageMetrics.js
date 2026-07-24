const mongoose = require('mongoose');

const aiUsageMetricsSchema = new mongoose.Schema(
  {
    feature: {
      type: String,
      required: true,
      index: true, // e.g., 'theory_evaluation', 'question_generation'
    },
    provider: {
      type: String,
      required: true,
    },
    model: {
      type: String,
      required: true,
    },
    tokensIn: {
      type: Number,
      default: 0,
    },
    tokensOut: {
      type: Number,
      default: 0,
    },
    estimatedCostUsd: {
      type: Number,
      default: 0,
    },
    latencyMs: {
      type: Number,
    },
    success: {
      type: Boolean,
      default: true,
    },
    errorDetails: {
      type: String,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      // Optional, depending on if the call was user-initiated or a background job
    },
  },
  {
    timestamps: true,
  }
);

// Index for daily/monthly aggregations
aiUsageMetricsSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AIUsageMetrics', aiUsageMetricsSchema);
