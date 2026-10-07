const mongoose = require('mongoose');

const mockInterviewWorkspaceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      required: true
    },
    resumeName: {
      type: String,
      default: 'Candidate_Resume.pdf'
    },
    jobDetails: {
      jobTitle: { type: String, required: true },
      company: { type: String, required: true },
      role: { type: String, default: '' },
      jobDescription: { type: String, required: true }
    },
    configuration: {
      interviewType: { type: String, default: 'Technical' }, // Technical, Behavioral, Project, Mixed
      difficulty: { type: String, default: 'Medium' },       // Easy, Medium, Hard
      mode: { type: String, default: 'Voice' },               // Text, Voice, Mixed
      questionCount: { type: Number, default: 10 }
    },
    status: {
      type: String,
      enum: ['READY', 'IN_PROGRESS', 'COMPLETED', 'NEEDS_IMPROVEMENT', 'IMPROVEMENT_IN_PROGRESS', 'IMPROVED'],
      default: 'READY'
    },
    attemptCount: { type: Number, default: 0 },
    latestAttemptId: { type: mongoose.Schema.Types.ObjectId, ref: 'Interview' },
    latestScore: { type: Number, default: null },
    bestScore: { type: Number, default: null },
    initialScore: { type: Number, default: null },
    improvementScore: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('MockInterviewWorkspace', mockInterviewWorkspaceSchema);
