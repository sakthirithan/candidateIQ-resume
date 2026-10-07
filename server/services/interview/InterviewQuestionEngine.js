const aiOrchestrator = require('../../ai/orchestrator/aiOrchestrator');
const { generateAdaptiveQuestionPrompt } = require('../../ai/prompts/interviewEnginePrompts');
const { AdaptiveQuestionSchema } = require('../../ai/schemas/interviewEngineSchemas');

class InterviewQuestionEngine {
  static async generateQuestion({ context, currentTurn = 1, askedQuestions = [], followUpsUsed = 0, targetDifficulty = 'MEDIUM' }) {
    const prompt = generateAdaptiveQuestionPrompt({
      context,
      currentTurn,
      askedQuestions,
      followUpsUsed,
      targetDifficulty
    });

    const fallbackGenerator = () => {
      // Clean, grounded static fallback question generation if AI service fails
      const candidateProjects = context.candidate?.projects || [];
      const primaryProject = candidateProjects[0] || { title: 'Technical Projects', technologies: ['React', 'Node.js'] };
      const techList = (primaryProject.technologies || ['React', 'Node.js']).join(', ');

      return {
        question: {
          id: `q_fallback_${Date.now()}`,
          text: `Can you explain your technical architecture and key challenges when building ${primaryProject.title} using ${techList}?`,
          type: 'PROJECT_DEEP_DIVE',
          difficulty: targetDifficulty || 'MEDIUM',
          topic: primaryProject.title,
          contextSource: ['candidate.projects[0]']
        },
        interviewPlan: {
          currentTopic: primaryProject.title,
          totalTopicsPlanned: 5,
          estimatedRemainingTurns: 4
        }
      };
    };

    const res = await aiOrchestrator.executeOperation({
      operation: 'generate_adaptive_question',
      prompt,
      schema: AdaptiveQuestionSchema,
      fallbackFn: fallbackGenerator
    });

    return res.json || fallbackGenerator();
  }
}

module.exports = InterviewQuestionEngine;
