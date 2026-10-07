const { z } = require('zod');

const MCQQuestionSchema = z.object({
  questionId: z.string().default(() => `mcq-${Date.now()}-${Math.floor(Math.random() * 1000)}`),
  question: z.string().min(15),
  scenario: z.string().optional(),
  task: z.string().optional(),
  options: z.array(z.string()).min(4),
  correctAnswer: z.string(),
  topic: z.string().default('General Technical'),
  difficulty: z.string().default('medium'),
  expectedSkills: z.array(z.string()).default([]),
  resumeEvidence: z.array(z.string()).default([]),
  jobEvidence: z.array(z.string()).default([]),
  evaluationFocus: z.array(z.string()).default([])
});

const VoiceQuestionSchema = z.object({
  questionId: z.string().default(() => `voice-${Date.now()}-${Math.floor(Math.random() * 1000)}`),
  question: z.string().min(20),
  scenario: z.string().optional(),
  task: z.string().optional(),
  topic: z.string().default('System Architecture & Communication'),
  difficulty: z.string().default('medium'),
  expectedSkills: z.array(z.string()).default([]),
  resumeEvidence: z.array(z.string()).default([]),
  jobEvidence: z.array(z.string()).default([]),
  evaluationFocus: z.array(z.string()).default([])
});

const TextQuestionSchema = z.object({
  questionId: z.string().default(() => `text-${Date.now()}-${Math.floor(Math.random() * 1000)}`),
  question: z.string().min(20),
  scenario: z.string().optional(),
  task: z.string().optional(),
  topic: z.string().default('Problem Solving & Technical Reasoning'),
  difficulty: z.string().default('medium'),
  expectedSkills: z.array(z.string()).default([]),
  resumeEvidence: z.array(z.string()).default([]),
  jobEvidence: z.array(z.string()).default([]),
  evaluationFocus: z.array(z.string()).default([])
});

const GeneratedMockInterviewSchema = z.object({
  interviewTitle: z.string().default('AI Mock Interview'),
  questions: z.object({
    mcq: z.array(MCQQuestionSchema).default([]),
    voice: z.array(VoiceQuestionSchema).default([]),
    text: z.array(TextQuestionSchema).default([])
  })
});

const ConfigurationInputSchema = z.object({
  difficulty: z.string().default('medium'),
  assessmentMethod: z.string().default('random'),
  totalQuestions: z.number().default(20),
  sections: z.array(
    z.object({
      type: z.string(),
      count: z.number()
    })
  ).default([
    { type: 'mcq', count: 15 },
    { type: 'voice', count: 3 },
    { type: 'text', count: 2 }
  ])
});

module.exports = {
  MCQQuestionSchema,
  VoiceQuestionSchema,
  TextQuestionSchema,
  GeneratedMockInterviewSchema,
  ConfigurationInputSchema
};
