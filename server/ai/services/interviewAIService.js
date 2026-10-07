const aiOrchestrator = require('../orchestrator/aiOrchestrator');
const interviewPrompts = require('../prompts/interviewPrompts');
const {
  MCQResponseSchema,
  QuestionResponseSchema,
  MockQuestionResponseSchema
} = require('../schemas/interviewSchemas');
const fallbackProvider = require('../providers/fallbackProvider');

/**
 * Interview Question & MCQ Generation AI Service
 */

class InterviewAIService {
  async generateMCQs(topic, difficulty = 'medium', count = 5) {
    const response = await aiOrchestrator.executeOperation({
      operation: 'generate_mcq',
      prompt: interviewPrompts.generateMCQ(topic, difficulty, count),
      schema: MCQResponseSchema,
      fallbackFn: async () => ({ questions: fallbackProvider.fallbackMCQ(topic, difficulty, count) }),
      metadata: { topic, difficulty, count }
    });

    if (response.result && Array.isArray(response.result.questions)) {
      response.result = response.result.questions;
    }
    return response;
  }

  async generateMockQuestionsFromResumeKeywords({ resumeKeywords, interviewType = 'mixed', difficulty = 'Mid-Level', count = 5 }) {
    // BACKEND AI CONTEXT GUARD: EXPLICITLY LOG & ENFORCE HR PROMPT EXCLUSION
    console.log('[MOCK_INTERVIEW]', {
      resumeKeywords: (resumeKeywords || []).map(k => typeof k === 'string' ? k : k.keyword),
      hrEvaluationPrompt: 'EXCLUDED'
    });

    const response = await aiOrchestrator.executeOperation({
      operation: 'generate_mock_questions',
      prompt: interviewPrompts.generateMockQuestionsFromResumeKeywords(resumeKeywords, interviewType, difficulty, count),
      schema: MockQuestionResponseSchema,
      fallbackFn: async () => {
        const kwList = (resumeKeywords || []).map(k => typeof k === 'string' ? k : (k.keyword || 'Software Engineering'));
        const fallbackKws = kwList.length > 0 ? kwList : ['React', 'Node.js', 'MongoDB', 'REST API', 'JavaScript'];

        const questions = Array.from({ length: count }).map((_, idx) => {
          const kw = fallbackKws[idx % fallbackKws.length];
          return {
            id: idx + 1,
            questionId: `q_00${idx + 1}`,
            sourceKeyword: kw,
            category: idx % 2 === 0 ? 'technical' : 'behavioural',
            question: `How do you design, optimize, and debug ${kw} features in production applications?`,
            targetSkill: kw,
            evaluationCriteria: `Measures technical clarity, architectural reasoning, and STAR framework delivery for ${kw}.`
          };
        });
        return { questions };
      },
      metadata: { keywordCount: (resumeKeywords || []).length, count }
    });

    if (response.result && Array.isArray(response.result.questions)) {
      response.result = response.result.questions;
    }
    return response;
  }

  async generateQuestions(candidateProfile, job, count = 5) {
    const response = await aiOrchestrator.executeOperation({
      operation: 'generate_questions',
      prompt: interviewPrompts.generateQuestions(candidateProfile, job, count),
      schema: QuestionResponseSchema,
      fallbackFn: async () => ({ questions: fallbackProvider.fallbackQuestions(candidateProfile, job, count) }),
      metadata: { jobTitle: job ? job.title : 'Software Engineer', count }
    });

    if (response.result && Array.isArray(response.result.questions)) {
      response.result = response.result.questions;
    }
    return response;
  }
}

module.exports = new InterviewAIService();
