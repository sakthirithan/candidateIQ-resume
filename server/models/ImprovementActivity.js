const mongoose = require('mongoose');

const improvementActivitySchema = new mongoose.Schema(
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
    category: {
      type: String,
      enum: ['communication', 'technical', 'behavioral'],
      required: true
    },
    skill: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    detectedIssue: {
      type: String,
      required: true
    },
    rootCause: {
      type: String
    },
    solutionDescription: {
      type: String,
      required: true
    },
    recommendedFramework: {
      type: String,
      enum: ['PEE', 'CEET', 'STAR', 'CONTROLLED_PAUSE', 'GENERAL'],
      default: 'GENERAL'
    },
    practiceType: {
      type: String,
      enum: ['voice', 'text', 'mcq'],
      default: 'voice'
    },
    durationMinutes: {
      type: Number,
      default: 5
    },
    priority: {
      type: String,
      enum: ['HIGH', 'MEDIUM', 'LOW'],
      default: 'MEDIUM'
    },
    targetMetricName: {
      type: String,
      required: true // e.g. 'fillerWordCount', 'clarityScore', 'technicalScore', 'starScore', 'wordsPerMinute'
    },
    unit: {
      type: String,
      default: 'score' // e.g. 'fillers / 2 min', 'score (0-100)', 'WPM'
    },
    comparisonOperator: {
      type: String,
      enum: ['<=', '>='],
      required: true
    },
    baselineValue: {
      type: Number,
      required: true
    },
    targetValue: {
      type: Number,
      required: true
    },
    latestValue: {
      type: Number,
      default: null
    },
    bestValue: {
      type: Number,
      default: null
    },
    status: {
      type: String,
      enum: ['PENDING', 'IN_PROGRESS', 'PRACTICE_REQUIRED', 'COMPLETED'],
      default: 'PENDING'
    },
    attemptCount: {
      type: Number,
      default: 0
    },
    improvementPercentage: {
      type: Number,
      default: 0
    },
    completedAt: {
      type: Date
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ImprovementActivity', improvementActivitySchema);
