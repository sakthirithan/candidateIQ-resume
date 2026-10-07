const mongoose = require('mongoose');

const candidateIntelligenceSnapshotSchema = new mongoose.Schema(
  {
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    overallScore: {
      value: { type: Number, default: 0 },
      max: { type: Number, default: 100 },
      confidence: { type: Number, default: 0 },
      status: { type: String, default: 'insufficient_data' }, // 'calculated' | 'insufficient_data'
      dimensionsEvaluated: { type: Number, default: 0 },
      totalDimensions: { type: Number, default: 5 },
      percentileText: { type: String, default: 'Percentile unavailable' },
      breakdown: mongoose.Schema.Types.Mixed
    },
    resumeQuality: {
      value: { type: Number, default: 0 },
      confidence: { type: Number, default: 0 },
      dataAvailable: { type: Boolean, default: false },
      criteria: [mongoose.Schema.Types.Mixed],
      improvementSuggestion: String,
      lastAnalyzed: Date
    },
    technicalScore: {
      value: { type: Number, default: 0 },
      confidence: { type: Number, default: 0 },
      dataAvailable: { type: Boolean, default: false },
      skillsEvaluatedCount: { type: Number, default: 0 },
      criteria: [mongoose.Schema.Types.Mixed],
      lastVerified: Date
    },
    marketJobMatch: {
      value: { type: Number, default: 0 },
      confidence: { type: Number, default: 0 },
      dataAvailable: { type: Boolean, default: false },
      matchedJobsCount: { type: Number, default: 0 },
      criteria: [mongoose.Schema.Types.Mixed]
    },
    interviewScore: {
      value: { type: Number, default: 0 },
      confidence: { type: Number, default: 0 },
      dataAvailable: { type: Boolean, default: false },
      completedCount: { type: Number, default: 0 },
      criteria: [mongoose.Schema.Types.Mixed]
    },
    behaviouralScore: {
      value: { type: Number, default: 0 },
      confidence: { type: Number, default: 0 },
      dataAvailable: { type: Boolean, default: false },
      criteria: [mongoose.Schema.Types.Mixed]
    },
    technicalSkills: [
      {
        skillId: String,
        name: String,
        score: Number,
        proficiencyLevel: String,
        confidence: Number,
        evidence: mongoose.Schema.Types.Mixed,
        sources: [String],
        lastVerifiedAt: Date
      }
    ],
    matchedJobs: [
      {
        jobId: String,
        title: String,
        company: String,
        location: String,
        workMode: String,
        salaryRange: String,
        requiredSkills: [String],
        preferredSkills: [String],
        experienceLevel: String,
        matchScore: Number,
        matchBreakdown: {
          matchedSkills: [String],
          partialSkills: [String],
          missingSkills: [String],
          experienceCompatibility: Number,
          technicalCompatibility: Number,
          overallCompatibility: Number
        },
        applicationStatus: String, // 'NOT_APPLIED', 'APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED', 'SELECTED', 'REJECTED', 'WITHDRAWN'
        appliedAt: Date,
        currentStage: String,
        postedAt: Date
      }
    ],
    dataCompleteness: {
      percentage: Number,
      hasResume: Boolean,
      hasProfile: Boolean,
      hasAssessments: Boolean,
      hasMockInterviews: Boolean,
      hasActualInterviews: Boolean,
      missingSources: [String]
    },
    formulaVersion: { type: String, default: 'candidate-iq-v2.0' },
    sourceRecords: [String],
    lastUpdated: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model('CandidateIntelligenceSnapshot', candidateIntelligenceSnapshotSchema);
