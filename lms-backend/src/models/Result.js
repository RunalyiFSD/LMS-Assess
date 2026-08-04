const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema(
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
    attempt: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Attempt',
      required: true,
    },
    totalMarks: {
      type: Number,
      required: true,
    },
    scoreObtained: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pass', 'fail'],
      required: true,
    },
    publishedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for leaderboard rankings and student lookup
resultSchema.index({ assessment: 1, scoreObtained: -1 });
resultSchema.index({ student: 1, assessment: 1 });

module.exports = mongoose.model('Result', resultSchema);
