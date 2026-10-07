const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    candidateIdString: String,
    sourceDocumentId: { type: String, default: () => `src_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`, index: true },
    contentHash: { type: String, default: '' },
    displayName: { type: String, default: '' },
    originalFileName: { type: String, default: '' },
    fileName: { type: String, required: true },
    fileType: { type: String, default: 'application/pdf' },
    fileSize: { type: Number, default: 0 },
    rawText: { type: String, default: '' },
    deletedAt: { type: Date, default: null },
    extractionStatus: {
      type: String,
      enum: ['uploaded', 'validating', 'extracting_text', 'analyzing_document', 'detecting_sections', 'extracting_content', 'awaiting_confirmation', 'confirmed', 'completed', 'analyzed', 'failed'],
      default: 'uploaded'
    },

    status: {
      type: String,
      default: 'analyzed'
    },
    file: {
      name: String,
      size: Number,
      mimeType: String,
      pageCount: { type: Number, default: 1 },
      rawText: String,
      base64Data: String,
      fileUrl: String
    },
    preview: {
      thumbnailUrl: String,
      pdfData: String,
      pageImages: [String]
    },
    target: {
      companyName: { type: String, default: '' },
      role: { type: String, default: '' },
      jobDescription: { type: String, default: '' }
    },
    extractedProfile: mongoose.Schema.Types.Mixed,
    analysis: mongoose.Schema.Types.Mixed,
    version: {
      type: Number,
      default: 1
    },
    versionHistory: [mongoose.Schema.Types.Mixed],
    extractedCandidate: {
      fullName: String,
      email: String,
      phone: String,
      location: String,
      headline: String
    },
    extractedSections: [
      {
        id: String,
        sectionType: String,
        title: String,
        selected: { type: Boolean, default: true },
        confidence: { type: Number, default: 0.95 },
        content: String,
        items: [mongoose.Schema.Types.Mixed],
        source: {
          pages: [Number]
        }
      }
    ],
    processingMetadata: {
      pageCount: { type: Number, default: 1 },
      totalSectionsDetected: { type: Number, default: 0 },
      resumeQualityScore: { type: Number, default: 85 },
      latencyMs: { type: Number, default: 0 }
    },
    keywords: {
      type: [String],
      default: []
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resume', resumeSchema);
