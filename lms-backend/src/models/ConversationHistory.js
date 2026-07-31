const mongoose = require('mongoose');

const conversationHistorySchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    contextId: {
      type: mongoose.Schema.Types.ObjectId,
      // Could be an Assessment ID, Question ID, or Course ID depending on context
      index: true,
    },
    contextType: {
      type: String,
      enum: ['assessment', 'question', 'general'],
      default: 'general',
    },
    messages: [
      {
        role: {
          type: String,
          enum: ['user', 'assistant', 'system'],
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ConversationHistory', conversationHistorySchema);
