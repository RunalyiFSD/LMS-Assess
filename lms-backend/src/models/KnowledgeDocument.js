const mongoose = require('mongoose');

/**
 * Metadata for documents embedded and stored in a vector database (Phase 3).
 * We store the source-of-truth metadata here, and just the vector ID.
 */
const knowledgeDocumentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
    },
    uploaderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fileUrl: {
      type: String, // Where the raw PDF/Text is stored (e.g. S3)
    },
    vectorDbId: {
      type: String, // ID in Pinecone/ChromaDB (for later)
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'embedded', 'failed'],
      default: 'pending',
    },
    chunkCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('KnowledgeDocument', knowledgeDocumentSchema);
