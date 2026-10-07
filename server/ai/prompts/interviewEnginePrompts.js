/**
 * interviewEnginePrompts.js
 * Generates prompt templates for CandidateIQ Adaptive AI Interview Engine.
 */

const generateAdaptiveQuestionPrompt = ({ context, currentTurn = 1, askedQuestions = [], followUpsUsed = 0, targetDifficulty = 'MEDIUM' }) => {
  return `
You are the CandidateIQ Adaptive AI Interviewer.

CANDIDATE CONTEXT & PROFILE:
${JSON.stringify(context.candidate, null, 2)}

${context.job ? `JOB CONTEXT (${context.interviewType.toUpperCase()} INTERVIEW):
${JSON.stringify(context.job, null, 2)}` : 'MOCK INTERVIEW (No Job Context required)'}

INTERVIEW STATE:
- Interview Type: ${context.interviewType.toUpperCase()}
- Current Turn: ${currentTurn}
- Target Difficulty: ${targetDifficulty}
- Follow-ups used on current topic: ${followUpsUsed}
- Previously Asked Questions: ${JSON.stringify(askedQuestions)}

RECENT CONVERSATION TURNS:
${JSON.stringify(context.conversation, null, 2)}

RULES & CRITICAL CONSTRAINTS:
1. NEVER invent projects, technologies, or claims not present in the candidate profile or job context.
2. If this is a FOLLOW_UP turn, ask a targeted follow-up probing the specific gap/unclear area from the previous answer.
3. If this is a NEW TOPIC turn, select an unasked area (e.g. candidate project architecture, specific technology, work experience, or scenario).
4. For MOCK interviews, focus heavily on candidate's declared projects and skills.
5. For ACTUAL interviews, evaluate alignment between candidate background and job requirements.
6. Return JSON conforming strictly to:
{
  "question": {
    "id": "q_${Date.now()}",
    "text": "<Concise, realistic interviewer question>",
    "type": "TECHNICAL" | "PROJECT_DEEP_DIVE" | "ARCHITECTURE" | "PROBLEM_SOLVING" | "EXPERIENCE" | "SCENARIO" | "BEHAVIOURAL" | "MCQ",
    "difficulty": "EASY" | "MEDIUM" | "HARD",
    "topic": "<Specific topic or project title>",
    "contextSource": ["candidate.projects[0]"],
    "options": [{"id": "A", "text": "..."}], // Optional for MCQ
    "correctOption": "A", // Optional for MCQ
    "explanation": "..." // Optional for MCQ
  },
  "interviewPlan": {
    "currentTopic": "<Current focus area>",
    "totalTopicsPlanned": 5,
    "estimatedRemainingTurns": 4
  }
}
`;
};

const evaluateAnswerPrompt = ({ question, candidateAnswer, context }) => {
  return `
You are the CandidateIQ Senior Technical & Communication AI Evaluator.

QUESTION ASKED:
${JSON.stringify(question, null, 2)}

CANDIDATE ANSWER:
"${candidateAnswer}"

CANDIDATE PROFILE CONTEXT:
${JSON.stringify(context.candidate, null, 2)}

${context.job ? `JOB CONTEXT:
${JSON.stringify(context.job, null, 2)}` : ''}

EVALUATION INSTRUCTIONS:
1. Evaluate Technical Correctness, Relevance, Completeness, Depth, and Clarity on a 0-100 scale based ONLY on what was asked and declared context.
2. Do NOT penalize short answers if they are factually accurate and complete.
3. Identify specific evidence (strengths and missing points).
4. Analyze English communication signals (grammar, vocabulary, coherence, fluency, filler words).
5. Extract evidence-based behavioural communication signals (ownership, specificity, structured problem solving). Do NOT make psychological diagnoses or derogatory claims.
6. Assign sentiment label (POSITIVE, NEUTRAL, NEGATIVE, MIXED) based on communication tone.
7. Decide the Next Action (CONTINUE, FOLLOW_UP, CLARIFY, PROBE, INCREASE_DIFFICULTY, CHANGE_TOPIC) with clear reason and focus.
8. Return ONLY JSON conforming strictly to TurnEvaluationSchema.
`;
};

const synthesizeFinalInterviewPrompt = ({ context, turnEvaluations, categoryScores }) => {
  return `
You are the CandidateIQ Lead Hiring Architect.

INTERVIEW SUMMARY DATA:
- Type: ${context.interviewType.toUpperCase()}
- Candidate: ${context.candidate.name} (${context.candidate.headline})
- Category Scores: ${JSON.stringify(categoryScores, null, 2)}

TURN-BY-TURN EVALUATIONS:
${JSON.stringify(turnEvaluations, null, 2)}

INSTRUCTIONS:
Provide a qualitative synthesis of the interview performance, highlighting top strengths, recommended improvement areas, and a summary explanation.
Return JSON matching:
{
  "summaryExplanation": "<Structured 2-3 paragraph professional qualitative summary>",
  "topStrengths": ["Strength 1", "Strength 2"],
  "recommendedImprovementAreas": ["Improvement 1", "Improvement 2"],
  "resumeComparisonExplanation": "<Consistency analysis relative to candidate profile>"
}
`;
};

module.exports = {
  generateAdaptiveQuestionPrompt,
  evaluateAnswerPrompt,
  synthesizeFinalInterviewPrompt
};
