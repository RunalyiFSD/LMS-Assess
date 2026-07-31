const mongoose = require('mongoose');

/**
 * Allows dynamic prompt tuning via Admin Dashboard without deploying code.
 * Replaces the file-based registry in later phases.
 */
const promptTemplateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true, // e.g., 'theory_eval_v1'
    },
    domain: {
      type: String,
      enum: ['evaluation', 'question', 'tutor', 'career', 'learning'],
      required: true,
    },
    content: {
      type: String,
      required: true, // The actual prompt string with {{variables}}
    },
    version: {
      type: Number,
      default: 1,
    },
    isActive: {
      type: Boolean,
      default: false, // Only one prompt per domain can be active at a time usually
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('PromptTemplate', promptTemplateSchema);
