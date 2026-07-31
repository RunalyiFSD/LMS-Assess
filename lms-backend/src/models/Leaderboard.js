const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema(
  {
    assessment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assessment',
      required: true,
      unique: true,
    },
    rankings: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        score: {
          type: Number,
          required: true,
        },
        timeTakenSeconds: {
          type: Number,
          required: true,
        },
        submittedAt: {
          type: Date,
          required: true,
        },
        rank: {
          type: Number,
          required: true,
        },
      },
    ],
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Leaderboard', leaderboardSchema);
