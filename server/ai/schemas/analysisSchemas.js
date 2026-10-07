const { z } = require('zod');

/**
 * Zod Schemas for English Language, Behavioral Signals, Sentiment, and Resume-Interview Comparison
 */

const LanguageAnalysisSchema = z.object({
  grammarScore: z.number().min(0).max(100).default(75),
  vocabularyScore: z.number().min(0).max(100).default(75),
  fluencyScore: z.number().min(0).max(100).default(75),
  coherenceScore: z.number().min(0).max(100).default(75),
  clarityScore: z.number().min(0).max(100).default(75),
  observations: z.array(z.string()).default([])
});

const BehaviouralSignalSchema = z.object({
  directness: z.number().min(0).max(100).default(75),
  responsiveness: z.number().min(0).max(100).default(75),
  logicalStructure: z.number().min(0).max(100).default(75),
  problemSolvingApproach: z.number().min(0).max(100).default(75),
  adaptabilityDemonstrated: z.number().min(0).max(100).default(75),
  projectOwnership: z.number().min(0).max(100).default(75),
  observations: z.array(z.string()).default([])
});

const SentimentAnalysisSchema = z.object({
  overall: z.enum(['positive', 'neutral', 'negative']).default('neutral'),
  confidence: z.number().min(0).max(1).default(0.8),
  engagement: z.string().default('Focused & professional'),
  observations: z.array(z.string()).default([])
});

const ResumeInterviewComparisonSchema = z.object({
  matchedClaims: z.array(z.string()).default([]),
  areasRequiringFurtherValidation: z.array(z.string()).default([]),
  technicalConsistency: z.number().min(0).max(100).default(75),
  experienceConsistency: z.number().min(0).max(100).default(75),
  explanation: z.string().default('Resume claims align with demonstrated candidate capabilities.')
});

module.exports = {
  LanguageAnalysisSchema,
  BehaviouralSignalSchema,
  SentimentAnalysisSchema,
  ResumeInterviewComparisonSchema
};
