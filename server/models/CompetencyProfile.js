const mongoose = require('mongoose');

const competencyProfileSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MockInterviewWorkspace',
      required: true
    },
    competency: {
      type: String,
      required: true // e.g. 'React', 'Node.js', 'System Design', 'Communication', 'Problem Solving'
    },
    currentScore: {
      type: Number,
      default: 0
    },
    confidenceScore: {
      type: Number,
      default: 0 // 0-100 confidence based on question evidence count & consistency
    },
    state: {
      type: String,
      enum: ['uncertain', 'weak', 'improving', 'competent', 'strong', 'declining'],
      default: 'uncertain'
    },
    trend: {
      type: String,
      enum: ['improving', 'stable', 'declining', 'insufficient_data'],
      default: 'insufficient_data'
    },
    evidenceCount: {
      type: Number,
      default: 0
    },
    lastEvaluatedAt: Date,
    lastAttemptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Interview'
    },
    topics: {
      type: mongoose.Schema.Types.Mixed,
      default: {} // e.g. { "Performance": { score: 60, count: 2 }, "Hooks": { score: 85, count: 3 } }
    },
    history: [
      {
        attemptId: { type: mongoose.Schema.Types.ObjectId, ref: 'Interview' },
        score: Number,
        confidence: Number,
        evaluatedAt: Date
      }
    ]
  },
  { timestamps: true }
);

competencyProfileSchema.index({ candidateId: 1, workspaceId: 1, competency: 1 }, { unique: true });

module.exports = mongoose.model('CompetencyProfile', competencyProfileSchema);
