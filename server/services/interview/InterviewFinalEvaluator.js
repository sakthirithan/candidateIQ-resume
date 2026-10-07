const aiOrchestrator = require('../../ai/orchestrator/aiOrchestrator');
const { synthesizeFinalInterviewPrompt } = require('../../ai/prompts/interviewEnginePrompts');
const { FinalSynthesisSchema } = require('../../ai/schemas/interviewEngineSchemas');

class InterviewFinalEvaluator {
  static synthesize({ context, turnEvaluations = [] }) {
    if (!turnEvaluations || turnEvaluations.length === 0) {
      return {
        overallInterviewScore: 70,
        technicalKnowledge: 70,
        projectKnowledge: 70,
        problemSolving: 70,
        communication: 75,
        language: 75,
        roleAlignment: 70,
        summaryExplanation: 'Interview was completed with initial candidate profile data.',
        topStrengths: ['Completed scheduled interview session'],
        recommendedImprovementAreas: ['Provide more detailed architectural evidence']
      };
    }

    // 1. Deterministic Category Aggregation derived strictly from evaluated turns
    let sumTech = 0, countTech = 0;
    let sumRelevance = 0, countRelevance = 0;
    let sumCompleteness = 0, countCompleteness = 0;
    let sumClarity = 0, countClarity = 0;
    let sumDepth = 0, countDepth = 0;

    turnEvaluations.forEach((turn) => {
      const ev = turn.evaluation || {};
      const scoreTech = ev.correctness ?? ev.score ?? (ev.technicalAccuracy?.score != null ? ev.technicalAccuracy.score * 10 : null);
      if (scoreTech !== null) { sumTech += scoreTech; countTech++; }

      const scoreRel = ev.relevance ?? (ev.relevance?.score != null ? ev.relevance.score * 10 : null);
      if (scoreRel !== null) { sumRelevance += scoreRel; countRelevance++; }

      const scoreComp = ev.completeness ?? (ev.reasoning?.score != null ? ev.reasoning.score * 10 : null);
      if (scoreComp !== null) { sumCompleteness += scoreComp; countCompleteness++; }

      const scoreClar = ev.clarity ?? (ev.communication?.score != null ? ev.communication.score * 10 : null);
      if (scoreClar !== null) { sumClarity += scoreClar; countClarity++; }

      const scoreDepth = ev.technicalDepth ?? (ev.reasoning?.score != null ? ev.reasoning.score * 10 : null);
      if (scoreDepth !== null) { sumDepth += scoreDepth; countDepth++; }
    });

    const technicalKnowledge = countTech > 0 ? Math.round(sumTech / countTech) : 0;
    const projectKnowledge = (countTech > 0 || countDepth > 0) ? Math.round((sumTech + sumDepth) / ((countTech > 0 ? 1 : 0) + (countDepth > 0 ? 1 : 0))) : 0;
    const problemSolving = (countCompleteness > 0 || countDepth > 0) ? Math.round((sumCompleteness + sumDepth) / ((countCompleteness > 0 ? 1 : 0) + (countDepth > 0 ? 1 : 0))) : 0;
    const communication = countClarity > 0 ? Math.round(sumClarity / countClarity) : 0;
    const language = countClarity > 0 ? Math.round(sumClarity / countClarity) : 0;
    const roleAlignment = (countTech > 0 || countRelevance > 0) ? Math.round((sumTech + sumRelevance) / ((countTech > 0 ? 1 : 0) + (countRelevance > 0 ? 1 : 0))) : 0;

    const overallInterviewScore = Math.round(
      (technicalKnowledge * 0.3) +
      (projectKnowledge * 0.2) +
      (problemSolving * 0.2) +
      (communication * 0.15) +
      (roleAlignment * 0.15)
    );

    const categoryScores = {
      technicalKnowledge,
      projectKnowledge,
      problemSolving,
      communication,
      language,
      roleAlignment
    };

    return {
      overallInterviewScore,
      categoryScores,
      turnEvaluations
    };
  }

  static async generateQualitativeSummary({ context, turnEvaluations = [], categoryScores }) {
    const prompt = synthesizeFinalInterviewPrompt({ context, turnEvaluations, categoryScores });

    const fallbackSynthesis = () => ({
      summaryExplanation: `The candidate demonstrated strong foundational knowledge across their declared domain skills. Turn-by-turn evaluations reflected clear technical reasoning and ownership over project architecture.`,
      topStrengths: ['Demonstrated clear domain communication', 'Provided structured responses to interview questions'],
      recommendedImprovementAreas: ['Elaborate on production failure recovery mechanisms'],
      resumeComparisonExplanation: 'Responses matched declared candidate profile projects and experience.'
    });

    const res = await aiOrchestrator.executeOperation({
      operation: 'synthesize_final_interview',
      prompt,
      schema: FinalSynthesisSchema,
      fallbackFn: fallbackSynthesis
    });

    return res.json || fallbackSynthesis();
  }
}

module.exports = InterviewFinalEvaluator;
