const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema(
  {
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    candidateIdString: String,
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MockInterviewWorkspace'
    },
    configurationSnapshot: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job'
    },
    jobIdString: String,
    jobTitle: String,
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume'
    },
    interviewCategory: {
      type: String,
      enum: ['mock', 'actual'],
      default: 'mock'
    },
    questionSource: {
      type: String,
      enum: ['resume_keywords', 'recruiter_job'],
      default: 'resume_keywords'
    },
    resumeKeywordSnapshot: {
      type: [mongoose.Schema.Types.Mixed],
      default: []
    },
    hrEvaluationPrompt: {
      type: String,
      default: undefined
    },
    contextSnapshot: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    interviewType: {
      type: String,
      default: 'mixed'
    },
    difficulty: {
      type: String,
      default: 'Mid-Level'
    },
    status: {
      type: String,
      enum: ['draft', 'generating', 'ready', 'in_progress', 'completed', 'failed', 'scheduled', 'cancelled'],
      default: 'ready'
    },
    startedAt: Date,
    completedAt: Date,
    scheduledDate: Date,
    notes: String,
    configuration: {
      difficulty: String,
      assessmentMethod: String,
      totalQuestions: Number,
      sections: [
        {
          type: { type: String },
          count: Number
        }
      ]
    },
    sourceSnapshot: {
      resume: mongoose.Schema.Types.Mixed,
      job: mongoose.Schema.Types.Mixed
    },
    mock_interview_questions: {
      mcq: [
        {
          questionId: String,
          question: String,
          options: [String],
          correctAnswer: String,
          userAnswer: String,
          isAnswered: { type: Boolean, default: false },
          answeredAt: Date,
          topic: String,
          difficulty: String,
          expectedSkills: [String],
          evaluation: mongoose.Schema.Types.Mixed
        }
      ],
      voice: [
        {
          questionId: String,
          question: String,
          transcript: String,
          answer: String,
          durationSeconds: Number,
          userAnswer: String,
          voiceMetrics: mongoose.Schema.Types.Mixed,
          isAnswered: { type: Boolean, default: false },
          answeredAt: Date,
          topic: String,
          difficulty: String,
          expectedSkills: [String],
          evaluation: mongoose.Schema.Types.Mixed
        }
      ],
      text: [
        {
          questionId: String,
          question: String,
          userAnswer: String,
          isAnswered: { type: Boolean, default: false },
          answeredAt: Date,
          topic: String,
          difficulty: String,
          expectedSkills: [String],
          evaluation: mongoose.Schema.Types.Mixed
        }
      ]
    },
    evaluation: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    progress: {
      currentQuestionIndex: { type: Number, default: 0 },
      answeredQuestions: { type: Number, default: 0 },
      totalQuestions: { type: Number, default: 0 }
    },
    metadata: {
      generationModel: String,
      generationVersion: String,
      generatedAt: Date
    },
    questions: [
      {
        questionId: mongoose.Schema.Types.Mixed,
        sourceKeyword: String,
        category: String,
        questionText: String,
        targetSkill: String,
        evaluationCriteria: String,
        candidateResponse: String,
        options: [
          {
            id: String,
            text: String
          }
        ],
        correctAnswer: String,
        mcqExplanation: String,
        voiceMeta: {
          audioUrl: String,
          durationSeconds: Number,
          transcript: String,
          confidence: Number
        },
        evaluation: {
          technicalScore: Number,
          communicationScore: Number,
          problemSolvingScore: Number,
          depthScore: Number,
          relevanceScore: Number,
          feedback: String,
          behaviouralEvidence: [String],
          keyStrengths: [String],
          areasForImprovement: [String]
        }
      }
    ],
    overallEvaluation: {
      overallInterviewScore: Number,
      technicalProficiency: Number,
      behaviouralCompetency: Number,
      communicationClarity: Number,
      problemSolvingRating: Number,
      mcqScore: Number,
      voiceScore: Number,
      summaryExplanation: String,
      topStrengths: [String],
      recommendedImprovementAreas: [String]
    },
    englishLanguageAnalysis: {
      grammarScore: Number,
      vocabularyScore: Number,
      fluencyScore: Number,
      coherenceScore: Number,
      clarityScore: Number,
      observations: [String]
    },
    behaviouralSignals: {
      directness: Number,
      responsiveness: Number,
      logicalStructure: Number,
      problemSolvingApproach: Number,
      adaptabilityDemonstrated: Number,
      projectOwnership: Number,
      observations: [String]
    },
    sentimentAnalysis: {
      overall: String,
      confidence: Number,
      engagement: String,
      observations: [String]
    },
    resumeComparison: {
      matchedClaims: [String],
      areasRequiringFurtherValidation: [String],
      technicalConsistency: Number,
      experienceConsistency: Number,
      explanation: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Interview', interviewSchema);
