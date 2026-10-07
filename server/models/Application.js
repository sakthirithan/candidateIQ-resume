const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true
    },
    jobIdString: String,
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    candidateIdString: String,
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    candidateProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CandidateProfile'
    },
    resumeSnapshot: {
      resumeId: String,
      fileName: String,
      fileUrl: String,
      parsedText: String,
      capturedAt: { type: Date, default: Date.now }
    },
    candidateSnapshot: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      mobile: { type: String, default: '' },
      location: { type: String, default: '' },
      gender: { type: String, default: 'Not Specified' }
    },
    professionalSnapshot: {
      userType: { type: String, default: 'Professional' }, // 'Professional' | 'Student / Fresher'
      designation: { type: String, default: '' },
      experience: { type: String, default: '' },
      organization: { type: String, default: '' },
      passingYear: { type: String, default: '' },
      skills: [String]
    },
    expectedCompensation: {
      amount: { type: Number, default: 0 },
      currency: { type: String, default: 'INR' },
      period: { type: String, default: 'year' },
      formatted: { type: String, default: 'Not specified' }
    },
    screeningAnswers: [
      {
        questionId: String,
        question: String,
        answer: String
      }
    ],
    termsAccepted: {
      type: Boolean,
      required: true,
      default: true
    },
    status: {
      type: String,
      enum: ['applied', 'under_review', 'interview_scheduled', 'shortlisted', 'rejected', 'selected', 'withdrawn'],
      default: 'applied'
    },
    matchAnalysis: {
      overallMatch: Number,
      technicalMatch: Number,
      experienceMatch: Number,
      educationMatch: Number,
      strongMatches: [String],
      missingSkills: [String],
      explanation: String,
      recommendation: String
    },
    jobSpecificATS: {
      overallScore: Number,
      status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'completed' },
      evaluatedAt: { type: Date, default: Date.now },
      configVersion: { type: Number, default: 1 },
      dimensions: {
        requiredSkillsMatch: { score: Number, maxScore: { type: Number, default: 30 }, details: String, matched: [String], missing: [String] },
        experienceRelevance: { score: Number, maxScore: { type: Number, default: 20 }, details: String },
        projectRelevance: { score: Number, maxScore: { type: Number, default: 15 }, details: String },
        technicalCompetency: { score: Number, maxScore: { type: Number, default: 15 }, details: String },
        responsibilitiesAlignment: { score: Number, maxScore: { type: Number, default: 10 }, details: String },
        educationRelevance: { score: Number, maxScore: { type: Number, default: 5 }, details: String },
        impactAndOutcomes: { score: Number, maxScore: { type: Number, default: 5 }, details: String }
      },
      evidence: [
        {
          dimension: String,
          level: String,
          excerpt: String,
          reasoning: String,
          confidence: String
        }
      ],
      summary: String,
      strengths: [String],
      gaps: [String],
      recommendation: String
    },
    overallScore: Number,
    mockInterviewEvidence: {
      attemptId: String,
      attemptDate: Date,
      overallScore: Number,
      overallFeedback: {
        summary: String,
        strengths: [String],
        areasForImprovement: [String]
      },
      competencies: [
        {
          competency: String,
          resumeEvidence: String,
          interviewEvidence: String,
          consistencyScore: Number
        }
      ],
      consistencyStatus: { type: String, default: 'Evaluated' }
    },
    activityHistory: [
      {
        eventType: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        description: String,
        actor: String
      }
    ]
  },
  { timestamps: true }
);

applicationSchema.index({ candidate: 1, job: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);

