const { z } = require('zod');

const AdaptiveQuestionSchema = z.object({
  question: z.object({
    id: z.string().default(() => `q_${Date.now()}`),
    text: z.string().min(5),
    type: z.enum(['TECHNICAL', 'PROJECT_DEEP_DIVE', 'ARCHITECTURE', 'PROBLEM_SOLVING', 'EXPERIENCE', 'SCENARIO', 'BEHAVIOURAL', 'MCQ']).default('TECHNICAL'),
    difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).default('MEDIUM'),
    topic: z.string().default('Technical Knowledge'),
    contextSource: z.array(z.string()).default([]),
    options: z.array(z.object({ id: z.string(), text: z.string() })).optional(),
    correctOption: z.string().optional(),
    explanation: z.string().optional()
  }),
  interviewPlan: z.object({
    currentTopic: z.string().default('General Overview'),
    totalTopicsPlanned: z.number().default(5),
    estimatedRemainingTurns: z.number().default(4)
  }).optional()
});

const TurnEvaluationSchema = z.object({
  evaluation: z.object({
    relevance: z.number().min(0).max(100).default(75),
    correctness: z.number().min(0).max(100).default(75),
    completeness: z.number().min(0).max(100).default(70),
    technicalDepth: z.number().min(0).max(100).default(70),
    clarity: z.number().min(0).max(100).default(80)
  }).default({ relevance: 75, correctness: 75, completeness: 70, technicalDepth: 70, clarity: 80 }),
  evidence: z.object({
    strengths: z.array(z.object({
      claim: z.string().default('Core concept explained'),
      evidence: z.string().default('Demonstrated understanding')
    })).default([]),
    missing: z.array(z.object({
      claim: z.string().default('Deeper trade-off discussion'),
      evidence: z.string().default('Elaborate on production metrics')
    })).default([])
  }).default({ strengths: [], missing: [] }),
  languageAnalysis: z.object({
    clarity: z.number().min(0).max(100).default(80),
    grammar: z.number().min(0).max(100).default(80),
    vocabulary: z.number().min(0).max(100).default(75),
    coherence: z.number().min(0).max(100).default(80),
    fluency: z.number().min(0).max(100).default(75),
    fillerWords: z.array(z.string()).default([]),
    repeatedPhrases: z.array(z.string()).default([])
  }).default({ clarity: 80, grammar: 80, vocabulary: 75, coherence: 80, fluency: 75, fillerWords: [], repeatedPhrases: [] }),
  behaviouralSignals: z.object({
    ownership: z.number().min(0).max(100).default(75),
    specificity: z.number().min(0).max(100).default(75),
    structuredApproach: z.number().min(0).max(100).default(75),
    responsiveness: z.number().min(0).max(100).default(80),
    observations: z.array(z.string()).default([])
  }).default({ ownership: 75, specificity: 75, structuredApproach: 75, responsiveness: 80, observations: ['Direct answer formulation'] }),
  sentiment: z.object({
    label: z.enum(['POSITIVE', 'NEUTRAL', 'NEGATIVE', 'MIXED']).default('NEUTRAL'),
    confidence: z.number().min(0).max(1).default(0.8),
    evidence: z.array(z.string()).default([])
  }).default({ label: 'POSITIVE', confidence: 0.85, evidence: [] }),
  nextAction: z.object({
    type: z.enum(['CONTINUE', 'FOLLOW_UP', 'CLARIFY', 'PROBE', 'INCREASE_DIFFICULTY', 'CHANGE_TOPIC']).default('CONTINUE'),
    reason: z.string().default('Sufficient technical detail demonstrated.'),
    focus: z.string().default('Next technical topic')
  }).default({ type: 'CONTINUE', reason: 'Sufficient technical detail demonstrated.', focus: 'Next technical topic' })
});

const FinalSynthesisSchema = z.object({
  summaryExplanation: z.string().default('The candidate demonstrated clear technical understanding across domain topics.'),
  topStrengths: z.array(z.string()).default(['Structured technical explanation', 'Good domain concept mastery']),
  recommendedImprovementAreas: z.array(z.string()).default(['Elaborate on production scalability metrics']),
  resumeComparisonExplanation: z.string().default('Candidate responses were consistent with declared experience and project metadata.')
});

module.exports = {
  AdaptiveQuestionSchema,
  TurnEvaluationSchema,
  FinalSynthesisSchema
};
