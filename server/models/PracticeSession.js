const mongoose = require('mongoose');

const practiceSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    sourceInterviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Interview',
      required: true
    },
    activityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ImprovementActivity',
      required: true
    },
    attemptNumber: {
      type: Number,
      required: true
    },
    practiceType: {
      type: String,
      enum: ['voice', 'text', 'mcq'],
      default: 'voice'
    },
    questions: [
      {
        questionId: String,
        questionText: String,
        targetSkill: String,
        category: String,
        expectedStructure: String
      }
    ],
    responses: [
      {
        questionId: String,
        questionText: String,
        audioUrl: String,
        rawTranscript: String,
        textAnswer: String,
        durationSeconds: Number
      }
    ],
    extractedMetrics: {
      fillerWordCount: { type: Number, default: 0 },
      wordsPerMinute: { type: Number, default: 0 },
      pauseCount: { type: Number, default: 0 },
      wordCount: { type: Number, default: 0 },
      clarityScore: { type: Number, default: 0 },
      structureScore: { type: Number, default: 0 },
      technicalScore: { type: Number, default: 0 },
      starScore: { type: Number, default: 0 }
    },
    targetMetrics: {
      targetMetricName: String,
      comparisonOperator: String,
      targetValue: Number,
      baselineValue: Number
    },
    result: {
      type: String,
      enum: ['PASS', 'FAIL', 'PENDING'],
      default: 'PENDING'
    },
    evaluatedValue: {
      type: Number,
      default: 0
    },
    scoreDelta: {
      type: Number,
      default: 0
    },
    feedbackText: {
      type: String
    },
    remediationGuidance: {
      type: String
    },
    evaluationDetails: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    startedAt: {
      type: Date,
      default: Date.now
    },
    completedAt: {
      type: Date
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('PracticeSession', practiceSessionSchema);
