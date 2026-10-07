const { z } = require('zod');

/**
 * Zod Schemas for Text Answer Evaluation, STT, and Unified Evaluation
 */

const TextAnswerEvaluationSchema = z.object({
  score: z.number().min(0).max(100).default(75),
  technicalCorrectness: z.number().min(0).max(100).default(75),
  relevance: z.number().min(0).max(100).default(75),
  completeness: z.number().min(0).max(100).default(75),
  reasoning: z.number().min(0).max(100).default(75),
  clarity: z.number().min(0).max(100).default(75),
  grammar: z.number().min(0).max(100).default(75),
  vocabulary: z.number().min(0).max(100).default(75),
  communicationQuality: z.number().min(0).max(100).default(75),
  feedback: z.string().default('Response demonstrates relevant technical context.'),
  strengths: z.array(z.string()).default([]),
  improvements: z.array(z.string()).default([])
});

const SpeechToTextSchema = z.object({
  transcript: z.string().default(''),
  language: z.string().default('en'),
  confidence: z.number().min(0).max(1).default(0.9),
  durationSeconds: z.number().default(0),
  segments: z.array(z.object({
    start: z.number().default(0),
    end: z.number().default(0),
    text: z.string().default('')
  })).default([])
});

const UnifiedInterviewEvaluationSchema = z.object({
  technical: z.object({
    score: z.number().min(0).max(100).default(75)
  }).default({ score: 75 }),
  problemSolving: z.object({
    score: z.number().min(0).max(100).default(75)
  }).default({ score: 75 }),
  communication: z.object({
    score: z.number().min(0).max(100).default(75)
  }).default({ score: 75 }),
  englishLanguage: z.object({
    score: z.number().min(0).max(100).default(75)
  }).default({ score: 75 }),
  mcq: z.object({
    score: z.number().min(0).max(100).default(75)
  }).default({ score: 75 }),
  voice: z.object({
    score: z.number().min(0).max(100).default(75)
  }).default({ score: 75 }),
  strengths: z.array(z.string()).default([]),
  improvements: z.array(z.string()).default([]),
  detailedExplanation: z.string().default('Evaluation complete.')
});

const MockAnswerEvaluationSchema = z.object({
  operation: z.string().default('mock_answer_evaluation'),
  status: z.string().default('success'),
  result: z.object({
    questionId: z.union([z.string(), z.number()]).optional(),
    sourceKeyword: z.string().optional(),
    score: z.number().min(0).max(100).default(75),
    technicalCorrectness: z.number().min(0).max(100).default(75),
    relevance: z.number().min(0).max(100).default(75),
    completeness: z.number().min(0).max(100).default(75),
    reasoning: z.number().min(0).max(100).default(75),
    clarity: z.number().min(0).max(100).default(75),
    strengths: z.array(z.string()).default([]),
    improvements: z.array(z.string()).default([]),
    feedback: z.string().default('Answer evaluated based on question and source keyword context.')
  })
});

module.exports = {
  TextAnswerEvaluationSchema,
  SpeechToTextSchema,
  UnifiedInterviewEvaluationSchema,
  MockAnswerEvaluationSchema
};
