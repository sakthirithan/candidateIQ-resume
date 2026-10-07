const { z } = require('zod');

/**
 * Zod Schemas for Dynamic Interview Questions & MCQ Generation
 */

const MCQOptionSchema = z.object({
  id: z.string(),
  text: z.string()
});

const MCQQuestionSchema = z.object({
  questionId: z.string().default(`mcq_${Date.now()}`),
  question: z.string(),
  options: z.array(MCQOptionSchema).length(4),
  correctAnswer: z.string(),
  explanation: z.string(),
  difficulty: z.string().default('medium'),
  category: z.string().default('general_technical')
});

const MCQResponseSchema = z.object({
  questions: z.array(MCQQuestionSchema).default([])
});

const FreeTextQuestionSchema = z.object({
  id: z.number().or(z.string()),
  sourceKeyword: z.string().default('Core Tech'),
  category: z.string().default('technical'),
  question: z.string(),
  targetSkill: z.string().default('Software Engineering'),
  evaluationCriteria: z.string().default('Demonstrates domain depth and logical clarity.')
});

const QuestionResponseSchema = z.object({
  questions: z.array(FreeTextQuestionSchema).default([])
});

const MockQuestionSchema = z.object({
  id: z.number().or(z.string()),
  questionId: z.string().optional(),
  sourceKeyword: z.string(),
  category: z.string().default('technical'),
  question: z.string(),
  targetSkill: z.string().default('Software Engineering'),
  evaluationCriteria: z.string().default('Demonstrates domain depth and logical clarity.'),
  options: z.array(MCQOptionSchema).optional(),
  correctAnswer: z.string().optional(),
  explanation: z.string().optional()
});

const MockQuestionResponseSchema = z.object({
  questions: z.array(MockQuestionSchema).default([])
});

module.exports = {
  MCQQuestionSchema,
  MCQResponseSchema,
  FreeTextQuestionSchema,
  QuestionResponseSchema,
  MockQuestionSchema,
  MockQuestionResponseSchema
};
