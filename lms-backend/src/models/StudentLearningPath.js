const mongoose = require('mongoose');

const studentLearningPathSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // One active/overall path per student
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    basedOnAssessments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assessment',
      },
    ],
    weaknessesIdentified: [
      {
        topic: String,
        confidenceScore: Number, // AI's confidence that this is a weakness
      },
    ],
    recommendedTopics: [
      {
        title: String,
        description: String,
        priority: {
          type: String,
          enum: ['high', 'medium', 'low'],
        },
      },
    ],
    careerSuggestions: [
      {
        title: String,
        matchPercentage: Number,
        reasoning: String,
      },
    ],
    isStale: {
      type: Boolean,
      default: false, // Set to true when new assessments are completed
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('StudentLearningPath', studentLearningPathSchema);
