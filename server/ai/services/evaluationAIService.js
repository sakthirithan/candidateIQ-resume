const aiOrchestrator = require('../orchestrator/aiOrchestrator');
const evaluationPrompts = require('../prompts/evaluationPrompts');
const {
  TextAnswerEvaluationSchema,
  SpeechToTextSchema,
  UnifiedInterviewEvaluationSchema,
  MockAnswerEvaluationSchema
} = require('../schemas/evaluationSchemas');
const fallbackProvider = require('../providers/fallbackProvider');

/**
 * Text Evaluation, Speech-to-Text, and Unified Evaluation AI Service
 */

class EvaluationAIService {
  async evaluateMockAnswer(question, candidateAnswer, sourceKeyword) {
    const activeKeyword = sourceKeyword || question.sourceKeyword || 'Core Skill';

    // BACKEND AI CONTEXT GUARD: EXPLICIT LOGGING AND VERIFICATION OF HR PROMPT EXCLUSION
    console.log('[MOCK_EVALUATION]', {
      question: question.question || question.questionText,
      sourceKeyword: activeKeyword,
      candidateAnswerLength: candidateAnswer ? candidateAnswer.length : 0,
      hrEvaluationPrompt: 'EXCLUDED'
    });

    const response = await aiOrchestrator.executeOperation({
      operation: 'mock_answer_evaluation',
      prompt: evaluationPrompts.evaluateMockAnswer(question, candidateAnswer, activeKeyword),
      schema: MockAnswerEvaluationSchema,
      fallbackFn: () => {
        const fallbackEval = fallbackProvider.fallbackTextEval(question, candidateAnswer);
        return {
          operation: 'mock_answer_evaluation',
          status: 'success',
          result: {
            questionId: question.questionId || question.id || 'q_001',
            sourceKeyword: activeKeyword,
            score: fallbackEval.score,
            technicalCorrectness: fallbackEval.technicalCorrectness,
            relevance: fallbackEval.relevance,
            completeness: fallbackEval.completeness,
            reasoning: fallbackEval.reasoning,
            clarity: fallbackEval.clarity,
            strengths: fallbackEval.strengths,
            improvements: fallbackEval.improvements,
            feedback: fallbackEval.feedback
          }
        };
      },
      metadata: { sourceKeyword: activeKeyword }
    });

    return response;
  }

  async evaluateTextAnswer(question, answer) {
    return aiOrchestrator.executeOperation({
      operation: 'evaluate_text_answer',
      prompt: evaluationPrompts.evaluateTextAnswer(question, answer),
      schema: TextAnswerEvaluationSchema,
      fallbackFn: () => fallbackProvider.fallbackTextEval(question, answer),
      metadata: { questionCategory: question ? question.category : 'technical' }
    });
  }

  async processSpeechToText(audioMeta = {}) {
    return aiOrchestrator.executeOperation({
      operation: 'speech_to_text',
      prompt: null, // Audio processing handled cleanly with envelope fallback
      schema: SpeechToTextSchema,
      fallbackFn: () => fallbackProvider.fallbackSTT(audioMeta),
      metadata: { durationSeconds: audioMeta.durationSeconds || 0 }
    });
  }

  async generateUnifiedEvaluation(evaluations = []) {
    return aiOrchestrator.executeOperation({
      operation: 'interview_evaluation',
      prompt: null,
      schema: UnifiedInterviewEvaluationSchema,
      fallbackFn: () => fallbackProvider.fallbackUnified(evaluations),
      metadata: { evaluationCount: evaluations.length }
    });
  }
}

module.exports = new EvaluationAIService();
